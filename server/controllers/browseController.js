const User = require("../models/User");
const Section = require("../models/Section");

exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select("username name createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(users);
  } catch (err) {
    console.error("Browse users error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserBoard = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const sections = await Section.find({ userId: user.auth0Id })
      .populate("items")
      .sort({ order: 1 });

    res.json({
      user: {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
      },
      sections: sections.map((section) => ({
        id: section._id,
        title: section.title,
        itemCount: section.items.length,
      })),
    });
  } catch (err) {
    console.error("Get user board error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
