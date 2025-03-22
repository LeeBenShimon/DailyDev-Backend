import request from 'supertest';
import { app } from './auth.test';

    test("Update user profile", async () => {
        const accessToken = "mockedAccessToken"; // Replace with a valid token if needed
        const response = await request(app)
            .put("/auth/updateProfile")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                username: "updateduser",
                bio: "This is a test bio",
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.user.username).toBe("updateduser");
        expect(response.body.user.bio).toBe("This is a test bio");
    });

    test("Fail to update profile without token", async () => {
        const response = await request(app).put("/auth/updateProfile").send({
            username: "updateduser",
        });
        expect(response.statusCode).toBe(401);
        expect(response.text).toContain("Missing token");
    });