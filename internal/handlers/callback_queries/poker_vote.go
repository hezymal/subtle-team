package callback_queries

import (
	"context"
	"fmt"
	"strings"

	"subtle-team/internal/messages"
	"subtle-team/internal/models/poker_dao"
	"subtle-team/internal/services/poker_service"
	"subtle-team/internal/vendors/bot_extensions"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

func PokerVoteHandler(pokerService *poker_service.PokerService) bot_extensions.HandlerFunc {
	return func(ctx context.Context, b *bot.Bot, update *models.Update) error {
		telegramMessage := update.CallbackQuery.Message.Message
		telegramChatId := telegramMessage.Chat.ID
		telegramMessageId := telegramMessage.ID
		telegramUser := update.CallbackQuery.From

		_, err := b.AnswerCallbackQuery(ctx, &bot.AnswerCallbackQueryParams{
			CallbackQueryID: update.CallbackQuery.ID,
			ShowAlert:       false,
		})
		if err != nil {
			return err
		}

		storyPoint, err := parsePokerVoteData(update.CallbackQuery.Data)
		if err != nil {
			return err
		}

		pokerId, voted, err := pokerService.VotePoker(poker_service.VotePokerRequestDTO{
			TelegramChatId:        telegramChatId,
			TelegramMessageId:     telegramMessageId,
			TelegramUserId:        telegramUser.ID,
			TelegramUserFirstName: telegramUser.FirstName,
			TelegramUserLastName:  telegramUser.LastName,
			TelegramUsername:      telegramUser.Username,
			StoryPoint:            storyPoint,
		})
		if err != nil {
			return err
		}

		if voted {
			poker, err := pokerService.GetPokerById(pokerId)
			if err != nil {
				return err
			}

			_, users, err := pokerService.GetPokerVotesAndUsersByPokerId(pokerId)
			if err != nil {
				return err
			}

			messageParams, err := messages.GetPokerVoteMessageParams(poker, users)
			if err != nil {
				return err
			}

			_, err = b.EditMessageText(ctx, messageParams)
			if err != nil {
				return err
			}
		}

		return nil
	}
}

func parsePokerVoteData(data string) (poker_dao.StoryPoint, error) {
	_, storyPointInString, found := strings.Cut(data, " ")
	if !found {
		return "", fmt.Errorf("Story point not found in string: %s", data)
	}

	storyPoint := poker_dao.StoryPoint(storyPointInString)
	if !storyPoint.IsValid() {
		return storyPoint, fmt.Errorf("Story point not found in string: %s", data)
	}

	return storyPoint, nil
}
