FROM golang:1.23

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY ./ ./

RUN go build -v -o /usr/local/bin/subtle-team ./cmd/...

CMD ["/usr/local/bin/subtle-team --config=/usr/src/app/config.yml"]
