# Employee Card Manager

This project is a web application that allows employees to manage their employee card, record their check-in (in) and check-out (out) times, and view their attendance records.

## Features

- **Employee Card Registration:** Employees can create and update their own employee card information.
- **Time Record Logging:** Users can record their in and out times throughout the day, ensuring accurate tracking of working hours.
- **Attendance Overview:** A dynamic calendar view displays daily and monthly attendance summaries with total working hours for each day.
- **Backend Integration:** The application interacts with an API to fetch attendance records.

## Hosted on AWS S3

The web application is hosted as a static site on AWS S3. You can access it here:

https://employee-card-management-web.s3.us-east-1.amazonaws.com/index.html

## Getting Started

1. Clone the repository.
2. Install the required dependencies (if applicable).
3. Configure any necessary API endpoints or local settings.
4. Open `index.html` or `working.html` in your browser to start using the application.

## Project Structure

- `index.html`: Main landing page for the Card Manager.
- `working.html`: Page for recording and viewing working hours.
- `membershipApi.js`: Handles API calls for employee membership and records.
- `README.md`: This documentation file.
- `package.json`: Contains project metadata and dependency definitions.
- `serverless.yml`: Configuration for deploying serverless functions or infrastructure.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License


