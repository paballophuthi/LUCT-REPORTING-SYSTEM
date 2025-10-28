import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DownloadService from '../../services/downloadService';
import StudentDashboard from './StudentDashboard';
import LecturerDashboard from './LecturerDashboard';
import PRLDashboard from './PRLDashboard';
import PLDashboard from './PLDashboard';
import FMGDashboard from './FMGDashboard';
import ComplaintForm from '../complaints/ComplaintForm';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    facultyStats: [],
    userStats: {},
    courseStats: {},
    classStats: {},
    reportStats: {},
    staffStats: {},
    systemStats: {},
    publicStats: {}
  });
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setDashboardLoading(true);
      setError(null);
      
      if (user) {
        // Fetch authenticated user statistics
        console.log('Fetching dashboard stats for authenticated user:', user.id);
        
        const requests = [
          api.get('/users/stats/faculty'),
          api.get('/users/dashboard-stats'),
          api.get('/courses/stats'),
          api.get('/classes/stats'),
          api.get('/reports/stats')
        ];

        // Add error handling to each request
        const responses = await Promise.all(
          requests.map(request => 
            request.catch(error => {
              console.error('API request failed:', error?.response?.data || error.message);
              return { data: {} };
            })
          )
        );

        const [
          facultyStatsRes,
          userStatsRes,
          courseStatsRes,
          classStatsRes,
          reportStatsRes
        ] = responses;

        const facultyStats = facultyStatsRes.data?.facultyStats || [];
        const userStats = userStatsRes.data?.stats || {};
        const courseStats = courseStatsRes.data?.stats || {};
        const classStats = classStatsRes.data?.stats || {};
        const reportStats = reportStatsRes.data?.stats || {};

        // Calculate derived statistics
        const staffStats = calculateStaffStats(facultyStats);
        const systemStats = calculateSystemStats(facultyStats, userStats, courseStats, classStats, reportStats);

        setStats({
          facultyStats,
          userStats,
          courseStats,
          classStats,
          reportStats,
          staffStats,
          systemStats,
          publicStats: systemStats
        });

      } else {
        // Fetch public statistics for non-authenticated users
        console.log('Fetching public stats for guest user');
        
        try {
          const publicStatsRes = await api.get('/users/public/stats');
          const publicStats = publicStatsRes.data || {};
          
          setStats(prevStats => ({
            ...prevStats,
            publicStats
          }));
        } catch (publicError) {
          console.error('Failed to fetch public stats:', publicError);
          // Set fallback data if API fails
          setStats(prevStats => ({
            ...prevStats,
            publicStats: {
              total_faculties: 3,
              total_students: 0,
              total_staff: 0,
              total_courses: 0,
              total_classes: 0,
              total_reports: 0
            }
          }));
        }
      }

    } catch (error) {
      console.error('Error in fetchDashboardStats:', error);
      setError('Unable to load dashboard data. Please check your connection and try again.');
      
      // Set empty stats to prevent crashes
      setStats({
        facultyStats: [],
        userStats: {},
        courseStats: {},
        classStats: {},
        reportStats: {},
        staffStats: {},
        systemStats: {},
        publicStats: {}
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  // Calculate staff statistics from faculty data
  const calculateStaffStats = (facultyStats) => {
    if (!Array.isArray(facultyStats)) {
      return {
        total_staff: 0,
        total_lecturers: 0,
        total_prls: 0,
        total_pls: 0,
        total_fmg: 0,
        staff_by_faculty: {}
      };
    }

    const staffByFaculty = {};
    let totalLecturers = 0;
    let totalPrls = 0;
    let totalPls = 0;
    let totalFmg = 0;

    facultyStats.forEach(faculty => {
      const lecturers = parseInt(faculty.lecturers) || 0;
      const prls = parseInt(faculty.prls) || 0;
      const pls = parseInt(faculty.pls) || 0;
      const fmg = parseInt(faculty.fmg) || 0;

      staffByFaculty[faculty.faculty] = {
        lecturers,
        prls,
        pls,
        fmg,
        total_staff: lecturers + prls + pls + fmg
      };

      totalLecturers += lecturers;
      totalPrls += prls;
      totalPls += pls;
      totalFmg += fmg;
    });

    return {
      total_staff: totalLecturers + totalPrls + totalPls + totalFmg,
      total_lecturers: totalLecturers,
      total_prls: totalPrls,
      total_pls: totalPls,
      total_fmg: totalFmg,
      staff_by_faculty: staffByFaculty
    };
  };

  // Calculate system-wide statistics
  const calculateSystemStats = (facultyStats, userStats, courseStats, classStats, reportStats) => {
    const totalFaculties = Array.isArray(facultyStats) ? facultyStats.length : 0;
    
    const totalStudents = parseInt(userStats.total_students) || 0;
    const totalStaff = parseInt(userStats.total_lecturers || 0) + 
                      parseInt(userStats.total_prls || 0) + 
                      parseInt(userStats.total_pls || 0) + 
                      parseInt(userStats.total_fmg || 0);

    const totalCourses = parseInt(courseStats.total_courses) || 0;
    const totalClasses = parseInt(classStats.total_classes) || 0;
    const totalReports = parseInt(reportStats.total_reports) || 0;

    // Calculate average attendance if available
    const avgAttendance = parseFloat(reportStats.avg_attendance_rate) || 0;

    return {
      total_faculties: totalFaculties,
      total_students: totalStudents,
      total_staff: totalStaff,
      total_courses: totalCourses,
      total_classes: totalClasses,
      total_reports: totalReports,
      avg_attendance_rate: avgAttendance
    };
  };

  const handleDownloadMyData = async () => {
    try {
      const result = await DownloadService.downloadMyData();
      if (result.success) {
        alert('Your data has been downloaded successfully!');
      } else {
        alert('Error downloading your data: ' + result.error);
      }
    } catch (error) {
      alert('Error downloading your data. Please try again.');
    }
  };

  // Safe number formatting
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '0';
    const parsed = parseInt(num);
    return isNaN(parsed) ? '0' : parsed.toLocaleString();
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined || num === '') return '0%';
    const parsed = parseFloat(num);
    return isNaN(parsed) ? '0%' : `${parsed.toFixed(1)}%`;
  };

  const getRoleDescription = () => {
    const descriptions = {
      student: 'Class Representative - Monitor reports and provide signatures for lecture verification',
      lecturer: 'Lecturer - Submit and manage lecture reports, track student attendance',
      prl: 'Principal Lecturer - Review reports, manage courses, and oversee academic quality',
      pl: 'Program Leader - Manage programs, course assignments, and academic planning',
      fmg: 'Faculty Management - Oversee faculty operations, system monitoring, and reporting'
    };
    return descriptions[user?.role] || 'Academic System User';
  };

  const getQuickActions = () => {
    const baseActions = [
      {
        label: 'Download My Data',
        action: handleDownloadMyData,
        color: 'secondary'
      },
      {
        label: 'Refresh Stats',
        action: fetchDashboardStats,
        color: 'secondary',
        disabled: dashboardLoading
      }
    ];

    if (user?.role !== 'fmg') {
      baseActions.unshift({
        label: 'File a Complaint',
        action: () => setShowComplaintForm(true),
        color: 'primary'
      });
    }

    return baseActions;
  };

  // Render statistics cards
  const renderStatCard = (title, value, subtitle, color = 'primary') => {
    const colors = {
      primary: '#007bff',
      success: '#28a745',
      warning: '#ffa500',
      info: '#6f42c1',
      danger: '#dc3545',
      teal: '#20c997'
    };

    return (
      <div className="stat-card">
        <div className="stat-card-content">
          <h3>{title}</h3>
          <div className="stat-value" style={{ color: colors[color] }}>
            {value}
          </div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
      </div>
    );
  };

  // Render public statistics (for non-authenticated users)
  const renderPublicStats = () => {
    const { publicStats } = stats;
    
    return (
      <div className="stats-grid">
        {renderStatCard(
          'Faculties', 
          formatNumber(publicStats.total_faculties), 
          'Academic divisions', 
          'primary'
        )}
        {renderStatCard(
          'Staff Members', 
          formatNumber(publicStats.total_staff), 
          'Lecturers & Administrators', 
          'success'
        )}
        {renderStatCard(
          'Students', 
          formatNumber(publicStats.total_students), 
          'Active learners', 
          'warning'
        )}
        {renderStatCard(
          'Courses', 
          formatNumber(publicStats.total_courses), 
          'Academic courses', 
          'info'
        )}
        {renderStatCard(
          'Classes', 
          formatNumber(publicStats.total_classes), 
          'Active classes', 
          'teal'
        )}
        {renderStatCard(
          'Reports', 
          formatNumber(publicStats.total_reports), 
          'Generated reports', 
          'danger'
        )}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="welcome-container">
        <div className="welcome-hero">
          <h1>Welcome to Academic Reporting System</h1>
          <p>Streamline your academic processes with our comprehensive management platform</p>
          <div className="welcome-actions">
            <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>
              Sign In to Continue
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/register'}>
              Create Account
            </button>
          </div>
        </div>

        {/* Public System Overview */}
        <div className="public-stats">
          <h2>System Overview</h2>
          {dashboardLoading ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Loading system statistics...</p>
            </div>
          ) : (
            renderPublicStats()
          )}
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">Lecture Reporting</div>
              <h3>Lecture Reporting</h3>
              <p>Comprehensive lecture reporting system with student verification and digital signatures.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">Attendance Tracking</div>
              <h3>Attendance Tracking</h3>
              <p>Real-time attendance monitoring and reporting for better student engagement tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">Complaint Management</div>
              <h3>Complaint Management</h3>
              <p>Streamlined complaint submission and resolution process for students and staff.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">Academic Monitoring</div>
              <h3>Academic Monitoring</h3>
              <p>Comprehensive monitoring and analytics for academic performance and activities.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    const roleComponents = {
      student: StudentDashboard,
      lecturer: LecturerDashboard,
      prl: PRLDashboard,
      pl: PLDashboard,
      fmg: FMGDashboard
    };

    const RoleComponent = roleComponents[user.role];
    return RoleComponent ? <RoleComponent /> : <div>Unknown user role: {user.role}</div>;
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome back, {user.name}!</h1>
          <p className="role-description">{getRoleDescription()}</p>
        </div>
        
        <div className="quick-actions">
          {getQuickActions().map((action, index) => (
            <button
              key={index}
              className={`btn btn-${action.color}`}
              onClick={action.action}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={fetchDashboardStats} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {showComplaintForm ? (
        <ComplaintForm 
          onCancel={() => setShowComplaintForm(false)}
          onSuccess={() => {
            setShowComplaintForm(false);
            alert('Complaint submitted successfully!');
            fetchDashboardStats();
          }}
        />
      ) : (
        <>
          {/* Role-specific Dashboard */}
          {renderDashboard()}

          {/* System Overview Section */}
          <div className="system-overview">
            <div className="section-header">
              <h2>System Overview</h2>
              <div className="tab-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'faculties' ? 'active' : ''}`}
                  onClick={() => setActiveTab('faculties')}
                >
                  Faculties
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
              </div>
              <button 
                onClick={fetchDashboardStats}
                className="btn btn-secondary btn-sm"
                disabled={dashboardLoading}
              >
                {dashboardLoading ? 'Updating...' : 'Refresh'}
              </button>
            </div>

            {dashboardLoading ? (
              <div className="loading-section">
                <div className="spinner"></div>
                <p>Loading system statistics...</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="stats-grid">
                      {renderStatCard(
                        'Total Faculties',
                        formatNumber(stats.systemStats.total_faculties),
                        'Academic divisions',
                        'primary'
                      )}
                      {renderStatCard(
                        'Total Staff',
                        formatNumber(stats.systemStats.total_staff),
                        `${formatNumber(stats.staffStats.total_lecturers)} lecturers`,
                        'success'
                      )}
                      {renderStatCard(
                        'Total Students',
                        formatNumber(stats.systemStats.total_students),
                        'Class representatives & learners',
                        'warning'
                      )}
                      {renderStatCard(
                        'Total Courses',
                        formatNumber(stats.systemStats.total_courses),
                        `${formatNumber(stats.courseStats.active_courses)} active`,
                        'info'
                      )}
                      {renderStatCard(
                        'Total Classes',
                        formatNumber(stats.systemStats.total_classes),
                        `${formatNumber(stats.classStats.active_classes)} active`,
                        'teal'
                      )}
                      {renderStatCard(
                        'Total Reports',
                        formatNumber(stats.systemStats.total_reports),
                        `${formatNumber(stats.reportStats.pending_approval)} pending`,
                        'danger'
                      )}
                    </div>

                    {/* Attendance Overview */}
                    {stats.systemStats.avg_attendance_rate > 0 && (
                      <div className="attendance-card">
                        <h3>Average Attendance Rate</h3>
                        <div className="attendance-value">
                          {formatPercentage(stats.systemStats.avg_attendance_rate)}
                        </div>
                        <div className="attendance-bar">
                          <div 
                            className="attendance-fill"
                            style={{ width: `${stats.systemStats.avg_attendance_rate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Faculties Tab */}
                {activeTab === 'faculties' && (
                  <div className="faculties-tab">
                    <div className="faculties-grid">
                      {stats.facultyStats.map((faculty, index) => {
                        const facultyStaff = stats.staffStats.staff_by_faculty?.[faculty.faculty] || {};
                        return (
                          <div key={faculty.faculty || index} className="faculty-card">
                            <h3>{faculty.faculty}</h3>
                            <div className="faculty-stats">
                              <div className="faculty-stat">
                                <span>Total Staff:</span>
                                <strong>{formatNumber(facultyStaff.total_staff)}</strong>
                              </div>
                              <div className="faculty-stat">
                                <span>Lecturers:</span>
                                <span className="stat-lecturers">{formatNumber(faculty.lecturers)}</span>
                              </div>
                              <div className="faculty-stat">
                                <span>PRLs:</span>
                                <span className="stat-prls">{formatNumber(faculty.prls)}</span>
                              </div>
                              <div className="faculty-stat">
                                <span>PLs:</span>
                                <span className="stat-pls">{formatNumber(faculty.pls)}</span>
                              </div>
                              <div className="faculty-stat">
                                <span>FMG:</span>
                                <span className="stat-fmg">{formatNumber(faculty.fmg)}</span>
                              </div>
                              <div className="faculty-stat">
                                <span>Students:</span>
                                <span className="stat-students">{formatNumber(faculty.students)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {stats.facultyStats.length === 0 && (
                      <div className="empty-state">
                        <p>No faculty data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="details-tab">
                    <div className="details-grid">
                      {/* Course Statistics */}
                      <div className="detail-card">
                        <h4>Course Statistics</h4>
                        <div className="detail-list">
                          <DetailItem label="Total Courses" value={formatNumber(stats.courseStats.total_courses)} />
                          <DetailItem label="Active Courses" value={formatNumber(stats.courseStats.active_courses)} highlight />
                          <DetailItem label="FICT Courses" value={formatNumber(stats.courseStats.fict_courses)} />
                          <DetailItem label="FBMG Courses" value={formatNumber(stats.courseStats.fbmg_courses)} />
                          <DetailItem label="FABE Courses" value={formatNumber(stats.courseStats.fabe_courses)} />
                        </div>
                      </div>

                      {/* Class Statistics */}
                      <div className="detail-card">
                        <h4>Class Statistics</h4>
                        <div className="detail-list">
                          <DetailItem label="Total Classes" value={formatNumber(stats.classStats.total_classes)} />
                          <DetailItem label="Active Classes" value={formatNumber(stats.classStats.active_classes)} highlight />
                          <DetailItem label="Students Enrolled" value={formatNumber(stats.classStats.total_students_enrolled)} />
                          <DetailItem label="FICT Classes" value={formatNumber(stats.classStats.fict_classes)} />
                          <DetailItem label="FBMG Classes" value={formatNumber(stats.classStats.fbmg_classes)} />
                          <DetailItem label="FABE Classes" value={formatNumber(stats.classStats.fabe_classes)} />
                        </div>
                      </div>

                      {/* Report Statistics */}
                      <div className="detail-card">
                        <h4>Report Statistics</h4>
                        <div className="detail-list">
                          <DetailItem label="Total Reports" value={formatNumber(stats.reportStats.total_reports)} />
                          <DetailItem label="Pending Approval" value={formatNumber(stats.reportStats.pending_approval)} status="warning" />
                          <DetailItem label="Student Approved" value={formatNumber(stats.reportStats.student_approved)} status="success" />
                          <DetailItem label="PRL Reviewed" value={formatNumber(stats.reportStats.prl_reviewed)} status="info" />
                          <DetailItem label="Completed" value={formatNumber(stats.reportStats.completed)} status="primary" />
                          <DetailItem label="Avg Attendance" value={formatPercentage(stats.systemStats.avg_attendance_rate)} status="teal" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Helper component for detail items
const DetailItem = ({ label, value, status = 'default', highlight = false }) => {
  const statusClasses = {
    default: '',
    success: 'detail-success',
    warning: 'detail-warning',
    info: 'detail-info',
    primary: 'detail-primary',
    teal: 'detail-teal'
  };

  return (
    <div className={`detail-item ${highlight ? 'detail-highlight' : ''} ${statusClasses[status]}`}>
      <span>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
};

export default Dashboard;