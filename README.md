# Employee Card Management

This project is a web application that allows employees to manage their own employee cards, record their check-in and check-out times, and view their attendance records.

## Features

- **Employee Card Creation:** Employees can create and update their own employee cards.
- **Attendance Management:** Record and view clock in and clock out times.
- **Web Interface:** Accessible through a user-friendly web interface.

## Current Deployment

The web application is hosted on AWS S3 and can be accessed at:

[Employee Card Management Web](https://employee-card-management-web.s3.us-east-1.amazonaws.com/index.html)

## Project Structure

- `index.html`: Main webpage for the application.
- `membershipApi.js`: JavaScript logic for handling employee cards and attendance records.
- `package.json`: Node.js project configuration and dependencies.
- `serverless.yml`: Configuration file for deploying the project using Serverless framework.
- `working.html`: Additional HTML page under development/test.

## Getting Started

To run the project locally:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Run the application locally (if applicable). For deployment specifics, refer to the `serverless.yml` file.

## Contributing

Contributions and suggestions are welcome. Please fork the repository and create pull requests for any improvements.

## License

[MIT](LICENSE)
