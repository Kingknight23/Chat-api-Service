// const authenticate = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.replace(
//             "Bearer ",
//             ""
//         );

//         if (!token) {
//             return res.status(401).json({
//                 message: "Authentication required"
//             });
//         }

//         /*
//          * The real implementation will verify the token
//          * using your authentication service.
//          *
//          * After verification:
//          *
//          * req.user = {
//          *     userId: "...",
//          *     roles: ["USER"]
//          * };
//          */

//         req.user = {
//             userId: token,
//             roles: ["USER"]
//         };

//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// export default authenticate;

const authenticate = async (req, res, next) => {
    try {
        console.log("Authorization header:", req.headers.authorization);

        const token = req.headers.authorization?.replace(
            "Bearer ",
            ""
        );

        console.log("Token:", token);

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        req.user = {
            userId: token,
            roles: ["USER"]
        };

        next();
    } catch (error) {
        next(error);
    }
};

export default authenticate;