import { User } from "@src/models/user";
import AuthService from "@src/services/auth";

describe('Users functional tests',()=> {

    beforeEach(async () =>{
        await User.deleteMany({});
    });

    describe('when creating a new user',()=>{
        it('should successfully create a new user with encrypted password', async()=>{
            const newUser = {
                name: 'John Doe',
                email: 'John@mail.com',
                password: '1234'
            };

            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(201);
            await expect(AuthService.comparePassword(newUser.password,response.body.password)).resolves.toBeTruthy();
            expect(response.body).toEqual(expect.objectContaining( { ... newUser, ... {password : expect.any(String)} } ) );


        });
        it('should return 422 when there is a validantion error', async()=>{
            const newUser = {
                email: 'John@mail.com',
                password: '1234'
            };

            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: 'User validation failed: name: Path `name` is required.',
            });

        });   
        
        it('should return 409 when the email already exists', async()=>{
            const newUser = {
                name: 'John Doe',
                email: 'John@mail.com',
                password: '1234'
            };

            await global.testRequest.post('/users').send(newUser);
            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                code: 409,
                error: 'User validation failed: email: already exists in the database.',
            });

        });

    });
});