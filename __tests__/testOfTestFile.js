const  request = require('supertest')
const app = require('../index')

describe('/test', () => {
    it('should return 200 and json with message', async () => {
        await request(app)
            .get('/test/test/t')
            .expect(200, { message: 'nani' })
    })

    it('should return 200 and json with message', async () => {
        await request(app)
            .post('/test/t')
            .expect(400, { message: 'nani' })
    })
})