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
{
    "query": `{
	  salads {
	    avocado,
	    tomato,
	    onion
	  }
	  burgers(count:3) {
	    shrimp
	  }
	}`
}
```



## 내맘대로 메뉴의 문제점

- 원하는대로 재료를 받기 위해서 각 요리의 재료를 모두 써야한다.

  ```javascript
  `query {
    salads { 
    	avocado,
  	tomato,
  	onion
    }
  }`
  ```

### 즐겨찾는 메뉴(Persisted Quries) 등록



## Persisted Quries 추가

```javascript
module.exports = {
  shrimpSalad: `{
 	burgers(count:3) {
      shrimp
    }
    salads {
      avocado
      tomato
      onion
    }
  }`
};
```



## Persisted Query 전처리

```javascript
// process with persisted queires
app.use('/graphql', bodyParser.json(), (req, res, next) => {
    // id로 요청을 하는 경우 전처리
    if (req.method === 'GET' && persistedQueries[req.query.id]) {
        req.query.query = persistedQueries[req.query.id];
        delete req.query.id;
    }
    if (req.method === 'POST' && persistedQueries[req.body.id]) {
        req.body.query = persistedQueries[req.body.id];
    }
    next();
});
// process with query
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));
```



## Persisted Query로 요청

```javascript
GET /graphql?id=shrimpSalad

or

POST /graphql
{
	"id": "shrimpSalad"
}
```



## Persisted Query

- GraphQL의 Spec에는 없는 항목이지만 보통 GraphQL을 이용할때 구현해서 사용한다.
- 서버에 저장해서 클라이언트는 해당하는 아이디만으로 요청한다. -> 결과는 같지만 요청 payload의 크기가 줄어든다.
- 서버에서 캐시를 이요할 때 Persisted Query를 활용할 수 있다.
- 보안을 위해서 Persisted Query로 요청하지 않는 경우는 모두 무시할 수 있다.



## REST와 GraphQL의 차이

|               | REST                                | GraphQL                 |
| ------------- | ----------------------------------- | ----------------------- |
| Response 모양 | Request 대상 오브젝트의 모양 그대로 | Request 모양 그대로     |
| Response 크기 | 서버에서 구현한대로 결정된다        | 요청 형식에 따라 다르다 |
|               |                                     |                         |

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

