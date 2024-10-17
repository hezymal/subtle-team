package poker_dao

import (
	"errors"
	"fmt"

	"subtle-team/internal/vendors/mongo_extensions"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type NewPokerEntity struct {
	Name              string             `bson:"name"`
	TelegramChatId    int64              `bson:"telegram_chat_id"`
	TelegramMessageId int                `bson:"telegram_message_id"`
	CreatorUserId     primitive.ObjectID `bson:"creator_user_id"`
	CreatedBy         int64              `bson:"created_by"`
	ModifiedBy        int64              `bson:"modified_by"`
}

type PokerEntity struct {
	Id                primitive.ObjectID `bson:"_id"`
	Name              string             `bson:"name"`
	TelegramChatId    int64              `bson:"telegram_chat_id"`
	TelegramMessageId int                `bson:"telegram_message_id"`
	CreatorUserId     primitive.ObjectID `bson:"creator_user_id"`
	CreatedBy         int64              `bson:"created_by"`
	ModifiedBy        int64              `bson:"modified_by"`
}

const POKER_COLLECTION_NAME = "poker"
const POKER_ENTITY_ID_NAME = "_id"
const POKER_ENTITY_TELEGRAM_CHAT_ID_NAME = "telegram_chat_id"
const POKER_ENTITY_TELEGRAM_MESSAGE_ID_NAME = "telegram_message_id"

type PokerDAO struct {
	mongoFacade *mongo_extensions.MongoFacade
	collection  *mongo.Collection
}

func NewPokerDAO(mongoFacade *mongo_extensions.MongoFacade) *PokerDAO {
	return &PokerDAO{
		mongoFacade: mongoFacade,
		collection:  mongoFacade.Db.Collection(POKER_COLLECTION_NAME),
	}
}

func (pokerDAO *PokerDAO) CreatePokerEntity(newEntity NewPokerEntity) (*primitive.ObjectID, error) {
	insertResult, err := pokerDAO.collection.InsertOne(pokerDAO.mongoFacade.Context, newEntity)
	if err != nil {
		return nil, err
	}

	entityId, ok := insertResult.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, errors.New("InsertedID can't be cast to primitive.ObjectID")
	}

	return &entityId, nil
}

func (pokerDAO *PokerDAO) GetPokerEntityById(entityId primitive.ObjectID) (*PokerEntity, error) {
	var entity PokerEntity

	filter := bson.M{
		POKER_ENTITY_ID_NAME: entityId,
	}

	err := pokerDAO.collection.FindOne(pokerDAO.mongoFacade.Context, filter).Decode(&entity)
	if err != nil {
		return nil, err
	}

	return &entity, nil
}

func (pokerDAO *PokerDAO) GetPokerEntityByTelegramChatIdAndMessageId(telegramChatId int64, telegramMessageId int) (*PokerEntity, error) {
	var entity PokerEntity

	filter := bson.M{
		POKER_ENTITY_TELEGRAM_CHAT_ID_NAME:    telegramChatId,
		POKER_ENTITY_TELEGRAM_MESSAGE_ID_NAME: telegramMessageId,
	}

	err := pokerDAO.collection.FindOne(pokerDAO.mongoFacade.Context, filter).Decode(&entity)
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("poker with telegram_chat_id=%d and telegram_message_id=%d not found", telegramChatId, telegramMessageId))
	}

	return &entity, nil
}
