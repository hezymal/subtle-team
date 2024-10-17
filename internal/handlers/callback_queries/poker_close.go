package callback_queries

import (
	"context"

	"subtle-team/internal/messages"
	"subtle-team/internal/services/poker_service"
	"subtle-team/internal/vendors/bot_extensions"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

func PokerCloseHandler(pokerService *poker_service.PokerService) bot_extensions.HandlerFunc {
	return func(ctx context.Context, b *bot.Bot, update *models.Update) error {
		_, err := b.AnswerCallbackQuery(ctx, &bot.AnswerCallbackQueryParams{
			CallbackQueryID: update.CallbackQuery.ID,
			ShowAlert:       false,
		})
		if err != nil {
			return err
		}

		telegramMessage := update.CallbackQuery.Message.Message
		telegramChatId := telegramMessage.Chat.ID
		telegramMessageId := telegramMessage.ID
		poker, err := pokerService.GetPokerByTelegramChatIdAndMessageId(telegramChatId, telegramMessageId)
		if err != nil {
			return err
		}

		votes, votedUsers, err := pokerService.GetPokerVotesAndUsersByPokerId(poker.Id)
		if err != nil {
			return err
		}

		messageParams, err := messages.GetPokerCloseMessageParams(*poker, votes, votedUsers)
		if err != nil {
			return err
		}

		_, err = b.EditMessageText(ctx, messageParams)
		if err != nil {
			return err
		}

		return nil
	}
}
