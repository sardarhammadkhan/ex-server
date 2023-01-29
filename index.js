const express = require("express");

const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
app.use(cors());
app.use(express.json());
app.use(express.static("../pages"));
app.use(bodyParser.urlencoded({ extended: true }));
const secret ='my-secret-key'
let users=[]
app.get('/',async(req,res)=>{
  res.send('hhhh')
})
app.post('/register',async(req,res)=>{
  try{  const { firstname, lastname, email, password } = req.body;
  const existUser = users.find((user)=>user.email==email);
  if (existUser) {
    return res.status(400).json({ msg: 'User already exists' });
  }
  
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser={
    firstname,
    lastname,
    email,
    password:hashedPassword
  }
 users.push(newUser)
 const token = jwt.sign({ id: newUser._id }, secret, {
  expiresIn: '1h'
});

res.json({ token });
}
 catch (err) {
    res.status(500).json({ error: err.message });
}
})
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
   console.log("userss",users);
    // Find the user in the database by email
    const exist =  users.find((user)=>user.email==email);
    console.log("eexistmail",exist);

    if (!exist) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, exist.password);
  console.log('match',isMatch);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
     // Create and sign the JWT
     const token = jwt.sign({ id: exist._id }, secret, {
      expiresIn: "1h",
    });
    console.log("eexistmail",exist);

    res.json({ token });
  }catch(err){
    res.send(err)
  }
})


// app.post("/chkcout-session", async (req, res) => {
//   let lineItems = [];
//   const items = req.body.items;
//   res.send(items);
//   items.forEach((item) => {
//     lineItems.push({
//       price: item.id,
//       quantity: item.quantity,
//     });
//   });
//   const session = await stripe.checkout.session.create({
//     line_items: lineItems,
//     mode: "payment",
//     success_url: "http://localhost:3000/success",
//     cancel_url: "http://localhost:3000/cancel",
//   });
//   res.send(
//     JSON.stringify({
//       url: session.url,
//     })
//   );
// });

const port = 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
