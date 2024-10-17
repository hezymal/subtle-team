FROM golang:1.23

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY ./ ./

RUN go build -v ./cmd/...

CMD ["./subtle-team --config=/usr/src/app/config.yml"]
