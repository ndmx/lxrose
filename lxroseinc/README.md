# Nursing and Health Services Platform

This project is a web application designed to provide nursing, mental health, and nutrition services. Users can book services, register as professionals, and access various tools and forms for a seamless experience. The project is responsive, modern, and integrates with Firebase for backend services like form submissions and data storage.

---

## Features

- **Nursing Services**: Users can book nursing services or register as nurses.
- **Mental Health Services**: Multiple therapy options available with booking forms.
- **Nutrition Services**: Custom nutrition plans and workshops with detailed booking options.
- **Responsive Design**: Optimized for mobile devices (iPhone 15 Pro and iPad) and desktop screens.
- **Firebase Integration**: All forms submit data to Firebase Firestore.
- **Intuitive UI/UX**: Easy navigation with forms featuring placeholders and validations.
- **Thematic Design**: Each service page is styled uniquely while maintaining consistency.

---

## Technologies Used

- **Frontend**:
  - React.js
  - HTML5/CSS3
  - Responsive design with media queries
- **Backend**:
  - Firebase Firestore (Database)
  - Firebase Hosting
- **Styling**:
  - Custom CSS files (e.g., `form.css`, `nurseServices.css`)
  - Media queries for device-specific optimizations
- **Deployment**:
  - Firebase Hosting
  - `react-scripts` build process for production

---

## Project Structure

/src
/components
- HeaderNav.js
- Footer.js
/pages
- NursingServices.js
- MentalServices.js
- NutritionServices.js
- About.js
- Contact.js
/utils
- NursingForms.js
/css
- headerNav.css
- footer.css
- general.css
- form.css
- nurseServices.css
- mentalServices.css
- nutritionServices.css
- sections.css
/

Usage
	1.	Navigate to the home page.
	2.	Select a service (Nursing, Mental Health, or Nutrition).
	3.	Use the provided forms to book services or register as a professional.
	4.	Admins can manage submissions via Firebase Firestore.

Contributing

    Contributions are welcome! Please fork the repository and create a pull request.


License
    This project is licensed under the MIT License. See the LICENSE file for details.