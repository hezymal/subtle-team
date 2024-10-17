package poker_dao

import (
	"errors"
	"time"

	"subtle-team/internal/vendors/mongo_extensions"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type NewPokerVoteEntity struct {
	PokerId    primitive.ObjectID `bson:"poker_id"`
	UserId     primitive.ObjectID `bson:"user_id"`
	StoryPoint StoryPoint         `bson:"story_point"`
	CreatedBy  int64              `bson:"created_by"`
}

type PokerVoteEntity struct {
	Id         primitive.ObjectID `bson:"_id"`
	PokerId    primitive.ObjectID `bson:"poker_id"`
	UserId     primitive.ObjectID `bson:"user_id"`
	StoryPoint StoryPoint         `bson:"story_point"`
	CreatedBy  int64              `bson:"created_by"`
}

const POKER_VOTE_COLLECTION_NAME = "poker-vote"
const POKER_VOTE_ENTITY_ID_NAME = "_id"
const POKER_VOTE_ENTITY_POKER_ID_NAME = "poker_id"
const POKER_VOTE_ENTITY_USER_ID_NAME = "user_id"

type PokerVoteDAO struct {
	mongoFacade *mongo_extensions.MongoFacade
	collection  *mongo.Collection
}

func NewPokerVoteDAO(mongoFacade *mongo_extensions.MongoFacade) *PokerVoteDAO {
	return &PokerVoteDAO{
		mongoFacade: mongoFacade,
		collection:  mongoFacade.Db.Collection(POKER_VOTE_COLLECTION_NAME),
	}
}

func (pokerVoteDAO *PokerVoteDAO) GetPokerVoteEntitiesByPokerId(pokerId primitive.ObjectID) ([]PokerVoteEntity, error) {
	var entities []PokerVoteEntity

	filter := bson.M{
		POKER_VOTE_ENTITY_POKER_ID_NAME: pokerId,
	}

	cursor, err := pokerVoteDAO.collection.Find(pokerVoteDAO.mongoFacade.Context, filter)
	if err != nil {
		return nil, err
	}

	err = cursor.All(pokerVoteDAO.mongoFacade.Context, &entities)
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (pokerVoteDAO *PokerVoteDAO) GetPokerVoteEntityByPokerIdAndUserId(pokerId primitive.ObjectID, userId primitive.ObjectID) (*PokerVoteEntity, error) {
	var entity PokerVoteEntity

	filter := bson.M{
		POKER_VOTE_ENTITY_POKER_ID_NAME: pokerId,
		POKER_VOTE_ENTITY_USER_ID_NAME:  userId,
	}

	err := pokerVoteDAO.collection.FindOne(pokerVoteDAO.mongoFacade.Context, filter).Decode(&entity)
	if err != nil {
		return nil, err
	}

	return &entity, nil
}

func (pokerVoteDAO *PokerVoteDAO) CreatePokerVoteEntity(pokerId primitive.ObjectID, userId primitive.ObjectID, storyPoint StoryPoint) (*primitive.ObjectID, error) {
	entity := NewPokerVoteEntity{
		PokerId:    pokerId,
		StoryPoint: storyPoint,
		UserId:     userId,
		CreatedBy:  time.Now().Unix(),
	}

	insertResult, err := pokerVoteDAO.collection.InsertOne(pokerVoteDAO.mongoFacade.Context, entity)
	if err != nil {
		return nil, err
	}

	entityId, ok := insertResult.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, errors.New("InsertedID can't be cast to primitive.ObjectID")
	}

	return &entityId, nil
}

func (pokerVoteDAO *PokerVoteDAO) UpdatePokerVoteEntity(entity *PokerVoteEntity) error {
	filter := bson.M{
		POKER_VOTE_ENTITY_ID_NAME: entity.Id,
	}

	update := bson.M{
		"$set": entity,
	}

	_, err := pokerVoteDAO.collection.UpdateOne(pokerVoteDAO.mongoFacade.Context, filter, update)

	return err
}
