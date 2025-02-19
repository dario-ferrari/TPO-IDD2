const UserCategoryService = require("../services/UserCategoryService");
const config = require("../../config");

const userCategoryService = new UserCategoryService(config);

class UserController {
    static async trackActivity(req, res) {
        try {
            const { userId, action } = req.body;
            await userCategoryService.trackUserActivity(userId, action);
            return res.status(200).json({ message: "Activity tracked" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getUserCategory(req, res) {
        try {
            const { userId } = req.params;
            const category = await userCategoryService.getUserCategory(userId);
            return res.status(200).json({ userId, category });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;