package user_dao

import (
	"errors"

	"subtle-team/internal/vendors/mongo_extensions"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type NewUserEntity struct {
	TelegramUserId int64  `bson:"telegram_user_id"`
	FirstName      string `bson:"first_name"`
	LastName       string `bson:"last_name"`
	Username       string `bson:"username"`
	CreatedBy      int64  `bson:"created_by"`
}

type UserEntity struct {
	Id             primitive.ObjectID `bson:"_id"`
	TelegramUserId int64              `bson:"telegram_user_id"`
	FirstName      string             `bson:"first_name"`
	LastName       string             `bson:"last_name"`
	Username       string             `bson:"username"`
	CreatedBy      int64              `bson:"created_by"`
}

const USER_COLLECTION_NAME = "user"
const USER_ENTITY_ID_NAME = "_id"
const USER_ENTITY_TELEGRAM_USER_ID_NAME = "telegram_user_id"

type UserDAO struct {
	mongoFacade *mongo_extensions.MongoFacade
	collection  *mongo.Collection
}

func NewUserDAO(mongoFacade *mongo_extensions.MongoFacade) *UserDAO {
	return &UserDAO{
		mongoFacade: mongoFacade,
		collection:  mongoFacade.Db.Collection(USER_COLLECTION_NAME),
	}
}

func (userDAO *UserDAO) GetUsersEntitiesByIds(entitiesIds []primitive.ObjectID) ([]UserEntity, error) {
	if len(entitiesIds) == 0 {
		return []UserEntity{}, nil
	}

	filter := bson.M{
		USER_ENTITY_ID_NAME: bson.M{
			"$in": entitiesIds,
		},
	}

	cursor, err := userDAO.collection.Find(userDAO.mongoFacade.Context, filter)
	if err != nil {
		return []UserEntity{}, err
	}

	entities := []UserEntity{}
	err = cursor.All(userDAO.mongoFacade.Context, &entities)
	if err != nil {
		return []UserEntity{}, err
	}

	return entities, nil
}

func (userDAO *UserDAO) GetUserEntityByTelegramUserId(telegramUserId int64) (*UserEntity, error) {
	var entity UserEntity

	filter := bson.M{
		USER_ENTITY_TELEGRAM_USER_ID_NAME: telegramUserId,
	}

	err := userDAO.collection.FindOne(userDAO.mongoFacade.Context, filter).Decode(&entity)
	if err != nil {
		return nil, err
	}

	return &entity, nil
}

func (userDAO *UserDAO) CreateUserEntity(newEntity NewUserEntity) (*primitive.ObjectID, error) {
	insertResult, err := userDAO.collection.InsertOne(userDAO.mongoFacade.Context, newEntity)
	if err != nil {
		return nil, err
	}

	entityId, ok := insertResult.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, errors.New("InsertedID can't be cast to primitive.ObjectID")
	}

	return &entityId, nil
}
