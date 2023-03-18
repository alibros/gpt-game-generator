const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});


const systemPrompt = `you are a javascript coder. ONLY RESPOND IN JAVASCRIPT. always start the code with //CODE-START and end it with //CODE-END.
user will ask you to write a game in pure javascript. The game must respect ALL the following requirements:
- you have access to a canvas with the id of "game-canvas" to put your game in. USE IT. the canvas size is fixed at 546px by 412px. the game should fully fit in it.
- add instructions on how to play it using a div with the id of "game-instructions".
- game should be easy to play and fun to play. not very fast.
- when the game ends immediately reset everything and restart it from the beginning.
- ONLY GIVE ME CODE. NO OTHER TYPES OF TEXT. pure validated javascript and nothing else
- do not include any comments or explantions or anything else. just pure javascript code.`;

app.post('/generate-game', async (req, res) => {



  const prompt = req.body.prompt;
  const OPENAI_API_KEY = 'YOUR API KEY HERE';
  console.log(prompt);

  const data = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }],
  };


  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`, 
        },
      })
    
    var  generatedCode = response.data.choices[0].message.content.trim();
    var newcode = generatedCode.replace(/```/g, "");
    newcode = newcode.replace(/ctx/g, "ctxxx");
    newcode = newcode.replace(/javascript/g, "");
    newcode = validateOutputcode(newcode);
    console.log(newcode);
    await saveGameToFile(newcode, prompt);
    res.json({ code: newcode });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate game code.' });
  }
});


//TODO: add a route to show the saved games
app.get('/games', (req, res) => {
    // Get all the files in the directory
    const gameNames = getGameNames();
    res.send(gameNames);

});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


function validateOutputcode(code) {
    let targetString = "//CODE-START";
    
    let index = code.indexOf(targetString);
    if (index !== -1) {
      let newString = code.substring(index);
      return newString; 
    } else {
      console.log("Target string not found.");
    }


}



function saveGameToFile(code, name) {
const filePath = path.join(__dirname, 'public/games', `${name}.js`);
const fileContent = code;

// Create the file if it doesn't exist
if (!fs.existsSync(filePath)) {
fs.writeFileSync(filePath, fileContent);
}

// Update the file content
fs.writeFileSync(filePath, fileContent);
}


// return the name of all the js files in /public/games as an string array
function getGameNames() {
    const dirPath = path.join(__dirname, 'public', 'games');
    const fileNames = fs.readdirSync(dirPath);
  
    const jsFileNames = fileNames.filter(fileName => {
      const fileExtension = path.extname(fileName);
      return fileExtension === '.js';
    });
  
    return jsFileNames;
}
