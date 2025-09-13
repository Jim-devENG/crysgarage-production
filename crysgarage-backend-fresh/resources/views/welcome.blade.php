<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crys Garage Backend</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .status {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
        }
        .endpoints {
            text-align: left;
            margin-top: 30px;
        }
        .endpoint {
            background: #f8f9fa;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Crys Garage Backend</h1>
        <div class="status">✅ System Online</div>
        <p>Professional audio mastering platform with ML-powered processing</p>
        
        <div class="endpoints">
            <h3>Available API Endpoints:</h3>
            <div class="endpoint"><strong>GET</strong> /api/health - Health check</div>
            <div class="endpoint"><strong>POST</strong> /api/upload-audio - Upload audio file</div>
            <div class="endpoint"><strong>POST</strong> /api/process-audio - Process audio with ML</div>
            <div class="endpoint"><strong>GET</strong> /api/processing-status/{id} - Get processing status</div>
            <div class="endpoint"><strong>GET</strong> /api/download/{id}/{format} - Download processed audio</div>
            <div class="endpoint"><strong>POST</strong> /api/payment/free-download - Free tier download</div>
        </div>
    </div>
</body>
</html>
