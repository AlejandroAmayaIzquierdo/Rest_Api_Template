
/// <reference types="App" />
declare namespace App {
	interface StandarFact {
		id: number;
		category: categories;
		fact: string;
	}
	
	type categories = "cats" | "dogs";
}


/// <reference types="lucia" />
declare namespace Lucia {
	type Auth = import("./lucia.js").Auth;
	type DatabaseUserAttributes = {
		userName: string;
	};
	type DatabaseSessionAttributes = {};
}

/// <reference types="Api" />
declare namespace Api {
	interface Response {
		status: number;
		error?: string | number | object;
		result?: string | number | object;
	}
	interface RegisterUserBody {
		userName: string;
		password: string;
	}
}
  