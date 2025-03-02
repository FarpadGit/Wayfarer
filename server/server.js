import fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import * as dotenv from "dotenv";
import * as service from "./service.js";
dotenv.config();
const { GUEST_USER_ID } = service;
const app = fastify();
app.register(sensible);
app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: { sameSite: "none", secure: true },
});
app.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: "userId",
});
app.addHook("onRequest", (req, res, done) => {
    if (!req.cookies.userId) {
        req.cookies.userId = GUEST_USER_ID;
        res.clearCookie("userId");
        res.setCookie("userId", GUEST_USER_ID, { path: "/" });
    }
    done();
});
app.addHook("onSend", async (req, res) => {
    res.headers({ userId: req.cookies.userId });
});
app.post("/login", async (req, res) => {
    const { userToken } = req.body;
    let CURRENT_USER_ID = "";
    if (userToken == null || userToken.email === "") {
        CURRENT_USER_ID = GUEST_USER_ID;
    }
    else {
        service.createUserIfNew({ ...userToken });
        CURRENT_USER_ID = userToken.email;
    }
    req.cookies.userId = CURRENT_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", CURRENT_USER_ID, { path: "/" });
    return true;
});
app.get("/categories", async (req, res) => {
    return await resolveAsync(service.getCategories());
});
app.get("/categories/:categoryId/posts", async (req, res) => {
    const { categoryId } = req.params;
    return await resolveAsync(service.getPostsByCategory(categoryId));
});
app.post("/categories/:categoryId/posts", async (req, res) => {
    const { title, body } = req.body;
    const { categoryId } = req.params;
    if (categoryId === "" || categoryId == null) {
        return res.send(app.httpErrors.badRequest("Minden posztnak tartoznia kell egy kategóriához"));
    }
    if (title === "" || title == null) {
        return res.send(app.httpErrors.badRequest("A poszt címe kötelező"));
    }
    if (body === "" || body == null) {
        return res.send(app.httpErrors.badRequest("A poszt törzse kötelező"));
    }
    return await resolveAsync(service.createPost({
        title,
        body,
        categoryId,
        uploaderId: req.cookies.userId,
    }));
});
app.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    return await resolveAsync(service.getPostWithComments(postId, req.cookies.userId));
});
app.delete("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    const response = await resolveAsync(service.deletePost(postId, req.cookies.userId));
    if (Object.keys(response).includes("PrivilegeError"))
        return res.send(app.httpErrors.unauthorized("Nincs jogosultságod törölni ezt a posztot!"));
    return response;
});
app.post("/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;
    const { message, parentId = null } = req.body;
    if (message === "" || message == null) {
        return res.send(app.httpErrors.badRequest("Az üzenet szövege kötelező"));
    }
    return await resolveAsync(service.createComment({
        message,
        postId,
        parentId,
        userId: req.cookies.userId,
    }));
});
app.put("/posts/:postId/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { message } = req.body;
    if (message === "" || message == null) {
        return res.send(app.httpErrors.badRequest("Az üzenet szövege kötelező"));
    }
    const response = await resolveAsync(service.updateComment({
        id: commentId,
        message,
        userId: req.cookies.userId,
    }));
    if (Object.keys(response).includes("PrivilegeError"))
        return res.send(app.httpErrors.unauthorized("Nincs jogosultságod szerkeszteni ezt az üzenetet!"));
    return response;
});
app.delete("/posts/:postId/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const response = await resolveAsync(service.deleteComment(commentId, req.cookies.userId));
    if (Object.keys(response).includes("PrivilegeError"))
        return res.send(app.httpErrors.unauthorized("Nincs jogosultságod törölni ezt az üzenetet!"));
    return response;
});
app.post("/posts/:postId/comments/:commentId/toggleLike", async (req, res) => {
    const { commentId } = req.params;
    return await resolveAsync(service.toggleLike(commentId, req.cookies.userId));
});
async function resolveAsync(promise) {
    const [error, data] = await app.to(promise);
    if (error)
        return app.httpErrors.internalServerError(error.message);
    return data;
}
app.listen({ port: +process.env.PORT });
export default async function handler(req, res) {
    await app.ready();
    app.server.emit("request", req, res);
}
