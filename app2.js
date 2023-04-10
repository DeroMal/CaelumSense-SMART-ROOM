require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require('path');
const mysql = require('mysql');
const ejs = require('ejs');
const moment = require('moment-timezone');

const app = express();

//sets the content type header to application/javascript before sending the file, which should inform the browser that the file contains JavaScript code.
app.get('/assets/js/:filename', (req, res) => {
    const filename = req.params.filename;
    res.set('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, `/public/assets/js/${filename}`));
});

// Set up MySQL connection
const dbCredentials = require('./db');

// Establish database connection using the credentials
const connection = mysql.createConnection({
    host: dbCredentials.host,
    user: dbCredentials.user,
    password: dbCredentials.password,
    database: dbCredentials.database
});

// Connect to MySQL
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up middleware for serving static files and parsing request body
app.use(express.static(path.join(__dirname, '/public/pages')));

// Route for getting sensor data
app.get('/public/pages', (req, res) => {
    // Query to get latest sensor data from database
    const query = 'SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1';

    // Execute query
    connection.query(query, (error, results) => {
        if (error) {
            console.log('Error executing query: ' + error.stack);
            res.status(500).send('Error retrieving sensor data');
            return;
        }

        // Send sensor data as JSON response
        res.json(results[0]);
    });
});

// ROUTES
// Route to fetch chart data from database
app.get('/chart-data', (req, res) => {
    const sql = 'SELECT * FROM sensor_data ORDER BY dateTime DESC LIMIT 10';
    connection.query(sql, (err, results) => {
        if (err) throw err;

        const chartData = {
            humidity: results.map((entry) => entry.humidity),
            temperature: results.map((entry) => entry.temperature),
            light: results.map((entry) => entry.light),
            dateTime: results.map((entry) => moment(entry.dateTime).format('MM Do, h:mm a'))
        };

        res.json(chartData);
    });
});
//Chart-2
app.get('/chart-data2', (req, res) => {
    const humiditySql = 'SELECT * FROM humidity_data ORDER BY dateTime DESC LIMIT 10';
    const temperatureSql = 'SELECT * FROM temperature_data ORDER BY dateTime DESC LIMIT 10';
    const lightSql = 'SELECT * FROM light_data ORDER BY dateTime DESC LIMIT 10';

    let humidityData, temperatureData, lightData;

    connection.query(temperatureSql, (err, results) => {
        if (err) throw err;

        temperatureData = {
            temperature: results.map((entry) => entry.temperature),
            dateTime: results.map((entry) => moment(entry.dateTime).format('MM Do, h:mm a'))
        };

        connection.query(humiditySql, (err, results) => {
            if (err) throw err;

            humidityData = {
                humidity: results.map((entry) => entry.humidity),
                dateTime: results.map((entry) => moment(entry.dateTime).format('MM Do, h:mm a'))
            };

            connection.query(lightSql, (err, results) => {
                if (err) throw err;

                lightData = {
                    light: results.map((entry) => entry.light),
                    dateTime: results.map((entry) => moment(entry.dateTime).format('MM Do, h:mm a'))
                };

                const chartData = {
                    humidityData,
                    temperatureData,
                    lightData
                };

                res.json(chartData);
            });
        });
    });
});

// Set up route for displaying paginated sensor data
app.get('/table', (req, res) => {
    const pageSize = 10; // number of records to display per page
    const currentPage = req.query.page || 1; // get current page from query parameter or default to page 1
    const startIndex = (currentPage - 1) * pageSize; // calculate start index of records to display

    // Query the database for sensor data
    const query = `SELECT * FROM sensor_data ORDER BY id DESC LIMIT ${startIndex},${pageSize}`;
    connection.query(query, (err, results) => {
        if (err) throw err;
        const sensorData = results.map(data => {
            const localTime = moment.tz(data.dateTime, 'Africa/Kampala');
            data.dateTime = localTime.format('Do[/]MM[/]YY - HH:mm:ss');
            return data;
        });
        const totalCountQuery = 'SELECT COUNT(*) AS totalCount FROM sensor_data';
        connection.query(totalCountQuery, (err, result) => {
            if (err) throw err;
            const totalCount = result[0].totalCount;
            const pageCount = Math.ceil(totalCount / pageSize);
            res.render('table', {
                sensorData,
                pageCount,
                currentPage,
            });
        });
    });
});

// Endpoint to receive sensor data
app.post('/sensor-data', (req, res) => {
    const { temperature, humidity, moisture, light } = req.body;

    // Validate inputs
    if (!temperature || !humidity) {
        return res.status(400).json({ error: 'Missing input data' });
    }

    // Insert data into database
    const sql = `INSERT INTO sensor_data (temperature, humidity, moisture, light) VALUES (${temperature}, ${humidity}, ${moisture}, ${light})`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error inserting data into database:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        res.status(200).json({ message: 'Sensor data saved successfully' });
    });
});

// Endpoint to receive actuator data
app.post('/actuator-data', (req, res) => {
    const { fanStatus, humidifierStatus, pumpStatus, lightStatus } = req.body;

    // Validate inputs
    if (!fanStatus || !humidifierStatus || !pumpStatus || !lightStatus) {
        return res.status(400).json({ error: 'Missing input data' });
    }

    // Insert data into database
    const sql = `INSERT INTO actuator_data (fanStatus, humidifierStatus, pumpStatus, lightStatus) VALUES ('${fanStatus}', '${humidifierStatus}', '${pumpStatus}', '${lightStatus}')`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error inserting data into database:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        res.status(200).json({ message: 'Actuator data saved successfully' });
    });
});

// Set up view engine and template directory
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Set up route for displaying the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/pages/dashboard.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});