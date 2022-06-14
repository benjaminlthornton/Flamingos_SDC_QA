import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '30s', target: 1000 },
    // { duration: '30s', target: 0 },
  ],
};

export default function () {
  const product_id = Math.floor(Math.random() * (1000011 - 900000) + 900000);
  http.get(`http://localhost:3000/qa/questions?product_id=${product_id}`);
}
