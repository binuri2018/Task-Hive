# Learning Community Platform

A modern web application for connecting learners, sharing knowledge, and tracking educational progress.

## Overview

This platform enables users to share their learning journey, create learning plans, track progress, and build a community around educational growth. The application features a responsive UI with a focus on user engagement and social interaction within the learning context.

## Key Features

### User Profiles
- Personalized user profiles with bio, skills, and contact information
- Follow/unfollow functionality to connect with other learners
- Profile statistics showing activity and engagement

### Learning Goals
- Create personalized learning objectives with target dates
- Categorize goals by topic (Programming, Design, Data Science, etc.)
- Track progress with a visual percentage-based system
- Mark goals as complete and celebrate achievements
- View goal statistics showing active vs. completed goals

### Learning Progress
- Share learning milestones and progress updates
- Document the learning journey with detailed descriptions
- Community engagement through likes and comments
- Track progress over time with updatable entries

### Learning Plans
- Create structured learning paths with sequential steps
- Share plans with the community for feedback and collaboration
- Follow others' learning plans as templates
- Track completion status of each plan

### Skill Sharing
- Share knowledge and skills through dedicated posts
- Attach images and detailed descriptions
- Engage with the community through likes and comments
- Discovery system for finding relevant content

## Tech Stack

### Frontend
- React.js with hooks for state management
- Tailwind CSS for responsive design
- Framer Motion for smooth animations and transitions
- React Router for navigation
- Axios for API communication

### Backend
- Java Spring Boot for REST API development
- MongoDB for data storage
- JWT for authentication and authorization
- Maven for dependency management

## Project Structure

```
├── FRONTEND/                  # Frontend React application
│   ├── src/
│   │   ├── api/               # API integration modules
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layout/            # Layout components
│   │   ├── Pages/             # Page components
│   │   ├── assets/            # Static assets
│   │   ├── App.jsx            # Main application component
│   │   └── main.jsx           # Application entry point
│   ├── public/                # Public assets
│   └── package.json           # Frontend dependencies and scripts
│
├── BACKEND/                   # Backend Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/Backend/
│   │   │   │   ├── config/    # Configuration classes
│   │   │   │   ├── controller/ # REST controllers
│   │   │   │   ├── dto/       # Data Transfer Objects
│   │   │   │   ├── enums/     # Enumeration types
│   │   │   │   ├── model/     # Data models
│   │   │   │   ├── repository/ # Database repositories
│   │   │   │   ├── service/   # Business logic services
│   │   │   │   └── BackendApplication.java # Application entry point
│   │   │   └── resources/     # Application resources
│   │   └── test/              # Unit and integration tests
│   └── pom.xml                # Maven dependencies and build config
│
└── README.md                  # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Java JDK 17 or higher
- MongoDB (v4.4 or higher)
- Maven

### Installation and Setup

1. **Clone the repository**
   ```
   git clone [repository-url]
   cd [repository-name]
   ```

2. **Backend Setup**
   ```
   cd BACKEND
   mvn clean install
   mvn spring-boot:run
   ```
   The backend API will be available at http://localhost:8080

3. **Frontend Setup**
   ```
   cd FRONTEND
   npm install
   npm run dev
   ```
   The frontend application will be available at http://localhost:5173

## Usage Examples

### Creating a Learning Goal
1. Navigate to your profile page
2. Click on the "Learning Goals" button
3. Use the "Add New Learning Goal" form to create a goal with a title, description, target date, and category
4. Track your progress by updating the percentage completion
5. Mark goals as complete when finished

### Sharing Learning Progress
1. Navigate to the main feed or profile page
2. Create a new progress entry with details about what you've learned
3. Add relevant tags and content
4. Share with the community
5. Engage with comments and feedback

### Creating Learning Plans
1. Navigate to the learning plans section
2. Create a structured plan with sequential steps
3. Categorize and tag the plan for discoverability
4. Track your progress through the plan steps

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All contributors who participate in this project
- The open-source community for providing amazing tools and libraries

  ## 👥 Authors
1. **Sadula** - (https://github.com/sadulae)
2. **Dilshan**  - (https://github.com/dilshangit12)
3. **Anurangi**  - (https://github.com/anurangiM)
4. **Binuri**  - (https://github.com/binuri2018)
