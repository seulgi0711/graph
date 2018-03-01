## REST~~aurant~~

### 메뉴

- 아보카도 샐러드 (GET /salads)
- 새우 버거 (GET /bugers)

### 먹고 싶은 음식

- 새우 샐러드 (새우가 3개가 들어감)



## 새우 샐러드 만들기

### 필요한 재료

- 아보카도 샐러드
- 새우 버거 3개

> 새우 버거 먹고싶어서 메뉴 2개 주문 -> 돈 낭비
>
> 메뉴가 2개 나올때까지 기다림, 나온 메뉴로 직접 만들어 먹기 -> 시간 낭비



## 새우 샐러드 메뉴

- 식당에서 새우 샐러드 메뉴를 제공했으면 좋을텐데... (GET /salad?with=shrimp )
- 식당에 새우 샐러드 메뉴 추가 요청
- 메뉴가 만들어 지기 전까지 메뉴 2개를 주문해서 직접 만들어 먹음



## 부족한 것, 필요 없는 것

- Under fetching: 아보카도 샐러드 주문 -> 새우 샐러드 부족
- Over fetching: 새우 버거 주문 -> 새우를 제외한 나머지 불 필요



## REST~~aurant~~의 고민

> 손님: 새우 샐러드 메뉴를 추가해 주시면 안될까요? 매 번 메뉴 4개를 시켜서 만들어 먹어야 해서 돈도 많이 들고 불편해요.

### 새우 샐러드 메뉴를 추가 할까?

### 아보카도 버거를 요청하는 손님이 나타나면 어쩌지? 이 때도 아보카도 버거 메뉴를 추가 해야 할까?



## REST~~aurant~~의 새로운 메뉴 (GraphQL)

- 내맘대로 메뉴 (GET /graphql or POST /graphql)

### 새우 샐러드

```javascript
GET /graphql?query={salads {avocado, tomato, onion} burgers(count:3) {shrimp}}

or

POST /graphql
`query {
  salads {
    avocado,
    tomato,
    onion
  }
  burgers(count:3) {
    shrimp
  }
}`
```



## REST와 GraphQL의 차이

|              | REST                                | GraphQL             |
| ------------ | ----------------------------------- | ------------------- |
| Request 결과 | Request 대상 오브젝트의 모양 그대로 | Request 모양 그대로 |
|              |                                     |                     |
|              |                                     |                     |

REST 요청 결과: 요청 데이터 모양 그대로

## Under- and over-fetching

```javascript
const express = require('express');
const app = express();

const get = (what, count) => what.splice(0, parseInt(count) || 1);
const salad = { avocado: 1, mango: 1, tomato: 0.2, arugula: true, onion: true };
const burger = { buns: 2, shrimp: 1, egg: 1, lettuce: 2.5, mayo: true };
const salads = new Array(100).fill(salad);
const burgers = new Array(100).fill(burger);


app.get('/salads', ({ query: { count } }, res) => 
    res.json(get(salads, count)));

app.get('/burgers', ({ query: { count } }, res) => 
    res.json(get(burgers, count)));

app.listen(4000);
```

