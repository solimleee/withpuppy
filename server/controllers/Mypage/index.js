const { User, Puppy, Message, Pinpointer } = require("../../models");
module.exports = {
  changeMypageInfo: async (req, res) => {
    try {
      const { type } = req.body;

      if (type === "user") {
        const id = req.body.userId;

        const formData = { ...req.body };
        delete formData.type;
        delete formData.userId;

        await User.update({ ...formData }, { where: { id } });

        const updatedUser = await User.findOne({ where: { id } });
        const puppy = await updatedUser.getPuppy();
        return res.status(200).json({ ...updatedUser.dataValues, puppy });
      }

      if (type === "puppy") {
        const userId = req.body.userId;
        const id = req.body.puppyId;

        const formData = { ...req.body };
        delete formData.type;
        delete formData.puppyId;
        delete formData.userId;

        await Puppy.update({ ...formData }, { where: { id } });

        const user = await User.findOne({ where: { id: userId } });
        const puppy = await user.getPuppy();

        return res.status(200).json({ ...user.dataValues, puppy });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "update mypageInfo failed" });
    }

    // const targetData = req.file.transforms.find((transform) => transform.id === "resized");
    // console.log(req.body.puppyId);
    // await Puppy.update({ puppyProfile: targetData.location }, { where: { id: req.body.puppyId } });
    // res.status(200).json(targetData.location);
  },
  getPinpointInfo: async (req, res) => {
    try {
      const { user } = req;

      // 1. find pinpointer and messages
      const targetUser = await User.findOne({ where: { email: user.email, social: user.social } });
      let pinpointers = await targetUser.getPinpointers({
        attributes: ["iconType", "location"],
        include: [
          {
            model: Message,
            attributes: ["text", "createdAt"],
            include: [
              {
                model: User,
                attributes: ["nickname", "thumbImg"],
                include: [
                  { model: Puppy, attributes: ["puppyName", "introduction"] },
                  {
                    model: User,
                    as: "follower",
                    attributes: ["id"],
                  },
                ],
              },
            ],
          },
        ],
      });

      pinpointers = pinpointers.map((pinpointer) => pinpointer.get({ plain: true }));

      pinpointers = pinpointers.map((pinpointer) => {
        let dataToSend = {};
        dataToSend.iconType = pinpointer.iconType;
        dataToSend.location = pinpointer.location;
        dataToSend.text = pinpointer.text;
        dataToSend.createdAt = pinpointer.createdAt;
        dataToSend.Messages = pinpointer.Messages.map((message) => {
          let messageData = {};

          messageData.text = message.text;
          messageData.createdAt = message.createdAt;
          messageData.nickname = message.User.nickname;
          messageData.thumbImg = message.User.thumbImg;
          messageData.puppyName = message.User.Puppy.puppyName;
          messageData.introduction = message.User.Puppy.introduction;
          messageData.likes = message.User.follower.length;

          return messageData;
        });
        return dataToSend;
      });

      res.status(200).json({ pinpointers });
    } catch (err) {
      console.log(err);
    }
  },
};