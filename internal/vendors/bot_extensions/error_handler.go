package bot_extensions

import (
	"context"
	"log"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

type HandlerFunc func(ctx context.Context, b *bot.Bot, update *models.Update) error

func WithMessageTextHandler(pattern string, matchType bot.MatchType, handler HandlerFunc) bot.Option {
	return bot.WithMessageTextHandler(pattern, matchType, func(ctx context.Context, b *bot.Bot, update *models.Update) {
		err := handler(ctx, b, update)
		if err != nil {
			log.Printf("handle error: %s", err.Error())
		}
	})
}

func WithCallbackQueryDataHandler(pattern string, matchType bot.MatchType, handler HandlerFunc) bot.Option {
	return bot.WithCallbackQueryDataHandler(pattern, matchType, func(ctx context.Context, b *bot.Bot, update *models.Update) {
		err := handler(ctx, b, update)
		if err != nil {
			log.Printf("handle error: %s", err.Error())
		}
	})
}
