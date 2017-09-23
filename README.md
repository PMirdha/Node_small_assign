# Node_small_assign
#Small server implementation on Node.js

Problem Statement

Implement a server which should be capable of doing the following:

1- Exposes a GET API as "api/request?connId=19&timeout=80" 
 This API will keep the request running for provided time on the server side. After the successful completion of the provided time it should return {"status":"ok"}

2- Exposes a GET API as "api/serverStatus" 
 This API returns all the running requests on the server with their time left for completion. E.g {"2":"15","8":"10"} where 2 and 8 are the connIds and 15 and 10 is the time remaining for the requests to complete (in seconds).

3- Exposes a PUT API as "api/kill" with payload as {"connId":12} 
This API will finish the running request with provided connId, so that the finished request returns {"status":"killed"} and the current request will return {"status":"ok"}. If no running request found with the provided connId on the server then the current request should return "status":"invalid connection Id : <connId>"}

You can try running your application with curl for testing. Try to implement the solution which would be efficient and scalable.

Bonus Points

- We would like you to implement the above by building a socket server accepting HTTP requests.

