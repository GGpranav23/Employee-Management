# TaskFlow Pro Backend

A comprehensive backend API for the TaskFlow Pro employee task management and shift allocation system. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Employee Management**: Complete CRUD operations for employee profiles and skill tracking
- **Task Management**: Task assignment, tracking, and automatic assignment algorithms
- **Shift Management**: Advanced shift scheduling with weekend coverage and leave replacements
- **Leave Management**: Leave request system with approval workflows
- **Security**: Rate limiting, input validation, password hashing, and security headers
- **Database**: MongoDB with Mongoose ODM for robust data modeling
- **API Documentation**: RESTful API design with comprehensive error handling

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskflow-pro-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/taskflow_pro_db
MONGODB_TEST_URI=mongodb://localhost:27017/taskflow_pro_test_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12
```

### 4. Database Setup

#### Option A: Local MongoDB Installation

1. Install MongoDB Community Edition from [MongoDB Official Website](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

### 5. Seed the Database

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample users (Team Leads and Employees)
- Employee profiles with skills and departments
- Sample tasks with different priorities and statuses
- Leave requests with various statuses

### 6. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🏗️ System Architecture

### Database Schema

#### Users Collection
- Authentication and user management
- Role-based access control (Team Lead, Employee)
- Password hashing and security features

#### Employees Collection
- Employee profiles and skill tracking
- Weekend scheduling preferences
- Performance metrics and skill points

#### Tasks Collection
- Task management with priority and difficulty levels
- Assignment tracking and completion status
- Skill-based task assignment

#### Shifts Collection
- Comprehensive shift scheduling
- Weekend and weekday shift management
- Employee availability and replacement tracking

#### Leaves Collection
- Leave request management
- Approval workflows
- Conflict detection with existing schedules

### API Architecture

```
/api
├── /auth          # Authentication endpoints
├── /users         # User management
├── /employees     # Employee management
├── /tasks         # Task management
├── /shifts        # Shift scheduling
└── /leaves        # Leave management
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "SecurePass123!",
  "role": "Employee"
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### GET /api/auth/me
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Employee Management

#### GET /api/employees
Get all employees with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name, email, or skills
- `skillLevel`: Filter by Junior/Senior
- `department`: Filter by department

#### POST /api/employees
Create a new employee profile (Team Lead only).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "skillLevel": "Senior",
  "skills": ["React", "TypeScript", "Node.js"],
  "department": "Frontend Development",
  "phone": "+1-555-0123"
}
```

#### PUT /api/employees/:id
Update employee profile (Team Lead only).

#### DELETE /api/employees/:id
Delete employee (Team Lead only).

### Task Management

#### GET /api/tasks
Get all tasks with filtering options.

**Query Parameters:**
- `status`: Filter by Pending/In Progress/Completed
- `priority`: Filter by Low/Medium/High
- `difficulty`: Filter by Easy/Medium/Hard
- `assignedTo`: Filter by employee ID
- `search`: Search in title, description, or required skill

#### POST /api/tasks
Create a new task (Team Lead only).

**Request Body:**
```json
{
  "title": "Implement User Dashboard",
  "description": "Create a comprehensive user dashboard with analytics",
  "difficulty": "Medium",
  "skillRequired": "React",
  "priority": "High",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "skillPointsReward": 35
}
```

#### PUT /api/tasks/:id/assign
Assign task to employee (Team Lead only).

**Request Body:**
```json
{
  "employeeId": "employee_id_here"
}
```

#### POST /api/tasks/:id/auto-assign
Automatically assign task to best-suited employee (Team Lead only).

#### PUT /api/tasks/:id/complete
Mark task as completed.

### Shift Management

#### GET /api/shifts
Get shifts for a specific time period.

**Query Parameters:**
- `weekStart`: Start date of the week (YYYY-MM-DD)
- `weekEnd`: End date of the week (YYYY-MM-DD)
- `employeeId`: Filter by specific employee

#### POST /api/shifts
Create a new shift (Team Lead only).

**Request Body:**
```json
{
  "type": "Morning",
  "date": "2024-02-01T00:00:00.000Z",
  "employees": ["employee_id_1", "employee_id_2"],
  "requirements": {
    "seniors": 1,
    "juniors": 1
  }
}
```

#### POST /api/shifts/generate-week
Generate complete weekly shift schedule (Team Lead only).

**Request Body:**
```json
{
  "weekStart": "2024-02-01T00:00:00.000Z"
}
```

### Leave Management

#### GET /api/leaves
Get leave requests with filtering.

**Query Parameters:**
- `status`: Filter by Pending/Approved/Rejected
- `type`: Filter by leave type
- `employeeId`: Filter by employee
- `startDate` & `endDate`: Filter by date range

#### POST /api/leaves
Create a new leave request.

**Request Body:**
```json
{
  "employeeId": "employee_id_here",
  "startDate": "2024-02-10T00:00:00.000Z",
  "endDate": "2024-02-12T00:00:00.000Z",
  "reason": "Medical appointment and recovery",
  "type": "Sick Leave"
}
```

#### PUT /api/leaves/:id/status
Approve or reject leave request (Team Lead only).

**Request Body:**
```json
{
  "status": "Approved",
  "reviewComments": "Approved for medical reasons"
}
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Team Lead vs Employee)
- Account lockout after failed login attempts
- Password strength requirements and hashing

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for frontend integration
- Security headers with Helmet.js
- Request size limiting

### Data Protection
- Password hashing with bcrypt
- Sensitive data exclusion from API responses
- Environment variable protection
- MongoDB injection prevention

## 🚀 Deployment

### Development Deployment

1. **Local Development:**
   ```bash
   npm run dev
   ```

2. **Environment Variables:**
   Ensure all required environment variables are set in `.env`

### Production Deployment

#### Option 1: Traditional Server Deployment

1. **Prepare Production Environment:**
   ```bash
   # Set NODE_ENV to production
   export NODE_ENV=production
   
   # Install production dependencies only
   npm ci --only=production
   ```

2. **Start Production Server:**
   ```bash
   npm start
   ```

3. **Process Management (PM2):**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start application with PM2
   pm2 start server.js --name "taskflow-backend"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

#### Option 2: Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:16-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run:**
   ```bash
   # Build Docker image
   docker build -t taskflow-backend .
   
   # Run container
   docker run -p 5000:5000 --env-file .env taskflow-backend
   ```

#### Option 3: Cloud Platform Deployment

**Heroku:**
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create taskflow-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

**Railway/Render/DigitalOcean:**
- Connect your GitHub repository
- Set environment variables in the platform dashboard
- Configure build and start commands

### Database Deployment

#### MongoDB Atlas (Recommended for Production)

1. Create MongoDB Atlas cluster
2. Configure network access and database users
3. Update `MONGODB_URI` with Atlas connection string
4. Enable MongoDB Atlas monitoring and backups

#### Self-Hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication and security
3. Set up regular backups
4. Configure monitoring and alerting

## 🔧 Frontend Integration

### CORS Configuration

The backend is configured to accept requests from your frontend application. Update the `FRONTEND_URL` environment variable to match your frontend deployment URL.

### API Base URL

Configure your frontend to use the backend API:

```javascript
// Frontend configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Example API call
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
```

### Authentication Integration

```javascript
// Store JWT token
localStorage.setItem('token', data.token);

// Include token in API requests
const token = localStorage.getItem('token');
const response = await fetch(`${API_BASE_URL}/employees`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for API endpoints
├── fixtures/       # Test data and fixtures
└── helpers/        # Test helper functions
```

### Example Test

```javascript
const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  test('POST /api/auth/login should authenticate user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Verify network connectivity for Atlas connections

#### 2. JWT Token Invalid
```
Error: Not authorized to access this route
```
**Solution:**
- Check `JWT_SECRET` configuration
- Verify token format in Authorization header
- Ensure token hasn't expired

#### 3. CORS Errors
```
Error: Access to fetch blocked by CORS policy
```
**Solution:**
- Update `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`
- Verify request headers and methods

#### 4. Rate Limiting
```
Error: Too many requests from this IP
```
**Solution:**
- Adjust rate limiting configuration
- Check if legitimate traffic is being blocked
- Consider IP whitelisting for development

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
DEBUG=app:* npm run dev
```

### Health Check

Test if the API is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-22T10:30:00.000Z",
  "environment": "development"
}
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Checks:**
   - `/api/health` endpoint for basic health monitoring
   - Database connectivity checks
   - Memory and CPU usage monitoring

2. **Error Tracking:**
   - Comprehensive error logging
   - Error categorization and alerting
   - Performance monitoring

3. **Analytics:**
   - API usage statistics
   - User activity tracking
   - Performance metrics

### Log Management

```javascript
// Example log configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section above
2. Review the API documentation
3. Create an issue in the repository
4. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Employee management system
  - Task assignment and tracking
  - Shift scheduling with weekend coverage
  - Leave management system

---

**Built with ❤️ for efficient workforce management**