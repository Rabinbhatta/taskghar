import bcrypt from "bcrypt";
import User from "../model/user.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, country, phone, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      res.status(404).json({ error: "Email already used!!" });
    } else {
      const passwordhash = await bcrypt.hash(password, 10);
      const newUser = new User({
        fullName,
        email,
        password: passwordhash,
        country,
        phone,
        role,
      });
      const savedUser = await newUser.save();

      res.status(201).json({ savedUser });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({ error: "Wrong password!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY);
    return res.status(200).json({
      jwt: token,
      user: {
        name: user.fullName,
        email: user.email,
        id: user._id,
        role: user.role,
        balance: user.balance,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
