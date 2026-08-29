const express = require("express");
const https = require("https");

const app = express();


app.use(express.static(__dirname));

// Read form data
app.use(express.urlencoded({ extended: true }));


// HOME PAGE
app.get("/", (req, res) => {

    res.sendFile(__dirname + "/index.html");

});


// FORM SUBMISSION
app.post("/", (req, res) => {

    console.log(req.body);

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;

    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Email:", email);


    // Data to send to Mailchimp
    const data = {
        email_address: email,
        status: "subscribed",
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName
        }
    };

    const jsonData = JSON.stringify(data);


    // Mailchimp API key
    const apiKey = "898298f05c140cfdd5610b55e18d7340-us1";


    // Mailchimp audience
    const url =
        "https://us1.api.mailchimp.com/3.0/lists/c18a75a7aa/members";


    const options = {
        method: "POST",

        auth: "key:" + apiKey,

        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(jsonData)
        }
    };


    // Send request to Mailchimp
    const request = https.request(url, options, (response) => {

        let responseData = "";

        response.on("data", (data) => {
            responseData += data;
        });


        response.on("end", () => {

            console.log("Mailchimp Status:", response.statusCode);

            try {

                const result = JSON.parse(responseData);

                console.log("Mailchimp Response:", result);

                if (response.statusCode >= 200 && response.statusCode < 300) {

                    res.send(`
                        <h1>Thank You!</h1>

                        <p>
                            Thank you ${firstName} ${lastName}.
                        </p>

                        <p>
                            Your email ${email} has been successfully subscribed.
                        </p>

                        <a href="/">Go Back</a>
                    `);

                } else {

                    res.send(`
                        <h1>Something went wrong</h1>

                        <p>
                            ${result.detail || "Mailchimp subscription failed."}
                        </p>

                        <a href="/">Go Back</a>
                    `);

                }

            } catch (error) {

                console.log("Invalid response:", responseData);

                res.send("Something went wrong.");

            }

        });

    });


    request.on("error", (error) => {

        console.log("Request Error:", error);

        res.send("Unable to connect to Mailchimp.");

    });


    request.write(jsonData);

    request.end();

});


// START SERVER
app.listen(3000, () => {

    console.log("Server is listening on port 3000");

});