package mongo_extensions

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoFacade struct {
	Context context.Context
	Client  *mongo.Client
	Db      *mongo.Database
}

func NewMongoService(ctx context.Context, connectionString string, databaseName string) (*MongoFacade, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connectionString))
	if err != nil {
		return nil, err
	}

	db := client.Database(databaseName)
	facade := MongoFacade{
		ctx,
		client,
		db,
	}

	return &facade, nil
}

func (mongoFacade MongoFacade) Close() error {
	return mongoFacade.Client.Disconnect(mongoFacade.Context)
}
