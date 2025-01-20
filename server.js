const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });  // Folder for uploaded images

app.post('/detect', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  // Prepare the image for sending to Python API
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));

  try {
    // Send the image to the Python API for prediction
    const response = await axios.post('http://localhost:5000/predict', form, {
      headers: form.getHeaders(),
    });

    // Send the predictions back to the frontend
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during object detection');
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const express = require('express');
// const multer = require('multer');
// const axios = require('axios');
// const FormData = require('form-data');
// const fs = require('fs');

// const app = express();
// const upload = multer({ dest: 'uploads/' });  // Folder for uploaded images

// // Define a root route to test the server
// app.get('/', (req, res) => {
//   res.send('Express server is running!');
// });

// app.post('/detect', upload.single('image'), async (req, res) => {
//   const imagePath = req.file.path;

//   // Prepare the image for sending to Python API
//   const form = new FormData();
//   form.append('image', fs.createReadStream(imagePath));

//   try {
//     // Send the image to the Python API for prediction
//     const response = await axios.post('http://localhost:5000/predict', form, {
//       headers: {
//         ...form.getHeaders(),
//         'Content-Type': 'multipart/form-data' // Ensure correct content type
//       },
//     });

//     // Send the predictions back to the frontend
//     res.json(response.data);
//   } catch (err) {
//     console.error('Error during object detection:', err.response ? err.response.data : err.message);
//     res.status(500).send('Error during object detection');
//   }
// });

// const PORT = 8080;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
