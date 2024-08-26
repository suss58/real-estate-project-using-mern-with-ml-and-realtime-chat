// const express = require('express');
// const { exec } = require('child_process');
// const router = express.Router();

// router.post('/predict', (req, res) => {
//     const houseData = req.body;

//     // Convert houseData to JSON string and pass to predict.py
//     const process = exec(`python3 ./utils/predict.py '${JSON.stringify(houseData)}'`);

//     let prediction = '';
//     process.stdout.on('data', (data) => {
//         prediction += data.toString();
//     });

//     process.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     process.on('close', (code) => {
//         res.status(200).json({ predictedPrice: parseFloat(prediction) });
//     });
// });

// module.exports = router;
