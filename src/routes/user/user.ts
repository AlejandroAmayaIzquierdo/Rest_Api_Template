import express from "express";
import auth from "../../database/lucia.js";


const userRoute = express.Router();


userRoute.post("/signup", async (req, res) => {
	const { userName, password } = req.body;
	if (
		typeof userName !== "string" ||
		userName.length < 4 ||
		userName.length > 31
	) {
		const response: Api.Response = {
			status: 0,
			error: "Invalid username"
		}
		return res.status(400).send(response);
	}
	if (
		typeof password !== "string" ||
		password.length < 6 ||
		password.length > 255
	) {
		const response: Api.Response = {
			status: 0,
			error: "Invalid password"
		}
		return res.status(400).send(response);
	}
	try {
		const user = await auth.createUser({
			key: {
				providerId: "id", // auth method
				providerUserId: userName.toLowerCase(), // unique id when using "username" auth method
				password // hashed by Lucia
			},
			attributes: {
				userName
			}
		});
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		console.log(session);
		if(session === null){
			const response: Api.Response = {
				status: 0,
				error: "Error while creating the session",
			}
			return res.status(402).send(response);
		}
		const response: Api.Response = {
			status: 1,
			result: session
		}
		return res.status(202).send(response);
	} catch (e) {
		return res.status(500).send({status : 0 , error: e});
	}
});

userRoute.post('/login', async (req,res) => {
	try {
		const { userName, password } = req.body as Api.RegisterUserBody;
		console.log(userName,password);
	
		const user = await auth.useKey(
			"id",
			userName.toLocaleLowerCase(),
			password
		);
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		if(!session) {
			const response: Api.Response = {
				status: 0,
				error: "Error while logIn"
			}
			return res.status(402).send(response);
		}
		const response: Api.Response = {
			status: 1,
			result: session
		}
		return res.status(202).send(response);
	} catch (err) {
		return res.status(500).send({status : 0 , error: err});
	}
});

export default userRoute;