const xlsx = require('xlsx');

class ExcelGenerator {
  static generateReportsExcel(reports) {
    const worksheet = xlsx.utils.json_to_sheet(reports.map(report => ({
      'Faculty': report.faculty_name,
      'Class': report.class_name,
      'Week': report.week_of_reporting,
      'Date': report.date_of_lecture,
      'Course': report.course_name,
      'Course Code': report.course_code,
      'Lecturer': report.lecturer_name,
      'Students Present': report.students_present,
      'Total Students': report.total_students,
      'Venue': report.venue,
      'Scheduled Time': report.scheduled_time,
      'Topic': report.topic_taught,
      'Learning Outcomes': report.learning_outcomes,
      'Status': report.status,
      'Created At': report.created_at
    })));

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Lecture Reports');
    
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static generateComplaintsExcel(complaints) {
    const worksheet = xlsx.utils.json_to_sheet(complaints.map(complaint => ({
      'Title': complaint.title,
      'Description': complaint.description,
      'Complainant Role': complaint.complainant_role,
      'Against Role': complaint.against_role,
      'Status': complaint.status,
      'Priority': complaint.priority,
      'Created At': complaint.created_at
    })));

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Complaints');
    
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

module.exports = ExcelGenerator;