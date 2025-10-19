import express, { Request, Response } from 'express';

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!');
});

app.listen(port, () => {
    console.log(`⚡ Server running at http://localhost:${port}`);
})