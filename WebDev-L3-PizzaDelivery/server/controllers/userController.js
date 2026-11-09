
const User = require("../models/User");

exports.syncUser = async (req, res) => {
  try {
    const firebaseUser = req.firebaseUser;

    const name =
      firebaseUser.name ||
      firebaseUser.email?.split("@")[0] ||
      "PizzaHut User";

    const user = await User.findOneAndUpdate(
      { firebaseUid: firebaseUser.uid },
      {
        $set: {
          name,
          email: firebaseUser.email.toLowerCase(),
          photoURL: firebaseUser.picture || "",
        },
        $setOnInsert: {
          role: "user",
        },
      },
      {
       returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      success: true,
      message: "User profile synchronized",
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User synchronization error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to synchronize user profile",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.firebaseUser.uid,
    }).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. Synchronize first.",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load profile",
    });
  }
};
