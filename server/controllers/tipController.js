import Tip from "../models/Tip.js";

export const getTips =
  async (req, res) => {
    try {
      const tips =
        await Tip.find({
          userId: req.user._id,
        }).sort({
          updatedAt: -1,
        });

      res.status(200).json(tips);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

export const createTip =
  async (req, res) => {
    try {
      const {
        title,
        body = "",
        topicId = "general",
        color = "#202020",
      } = req.body;

      const cleanTitle =
        title?.trim();

      const cleanBody =
        body?.trim();

      if (
        !cleanTitle &&
        !cleanBody
      ) {
        return res.status(400).json({
          message:
            "Tip title or body is required",
        });
      }

      const tip =
        await Tip.create({
          title:
            cleanTitle ||
            "Untitled tip",
          userId: req.user._id,
          body: cleanBody,
          topicId,
          color,
        });

      return res.status(201).json(tip);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };

export const updateTip =
  async (req, res) => {
    try {
      const {
        title,
        body = "",
        topicId = "general",
        color = "#202020",
      } = req.body;

      const cleanTitle =
        title?.trim();

      const cleanBody =
        body?.trim();

      if (
        !cleanTitle &&
        !cleanBody
      ) {
        return res.status(400).json({
          message:
            "Tip title or body is required",
        });
      }

      const tip =
        await Tip.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user._id,
          },
          {
            title:
              cleanTitle ||
              "Untitled tip",
            body: cleanBody,
            topicId,
            color,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!tip) {
        return res.status(404).json({
          message:
            "Tip not found",
        });
      }

      return res.status(200).json(tip);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };

export const deleteTip =
  async (req, res) => {
    try {
      const tip =
        await Tip.findOneAndDelete({
          _id: req.params.id,
          userId: req.user._id,
        });

      if (!tip) {
        return res.status(404).json({
          message:
            "Tip not found",
        });
      }

      return res.status(200).json({
        message:
          "Tip deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };
