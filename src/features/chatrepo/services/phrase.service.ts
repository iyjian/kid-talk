import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { PhraseSentence } from '../entities/phrase.sentence.entity'
import { OpenaiService } from './../../openai/openai.service'
import { makeSentencePrompt } from './prompts'

@Injectable()
export class PhraseService {
  constructor(
    @InjectModel(PhraseSentence)
    private readonly phraseSentenceModel: typeof PhraseSentence,
    private readonly openAIService: OpenaiService,
  ) {}

  async createSentencesWithSpeech(payload: {
    grade: string
    unit: string
    phrases: string[]
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    speed: number
  }) {
    for (const phrase of payload.phrases) {
      // 判断该phrase是否已经被生成过，如果生成过则不要重新生成
      const existingPhraseCount = await this.phraseSentenceModel.count({
        where: {
          phrase,
        },
      })

      if (existingPhraseCount) {
        console.log(
          `phrase: ${phrase} has already had ${existingPhraseCount} sentences`,
        )
        continue
      }

      const quest = makeSentencePrompt(phrase)

      const askResponse = await this.openAIService.ask(quest)

      const answer = askResponse.choices[0].message.content

      /**
        Sure, here are three example sentences that increase in difficulty for the phrase "start a topic":

        level 1: We can start a topic about our favorite books during the reading lesson.
        level 2: The teacher asked the students to start a topic for their group discussion.
        level 3: During the meeting, it was difficult to start a topic that everyone was interested in, but eventually, they began talking about new technology trends.
       */

      const sentences = answer.split('\n')
      console.log(sentences)

      for (let sentence of sentences) {
        if (
          /^level/i.test(sentence) &&
          sentence.toLowerCase().indexOf(phrase.toLowerCase()) !== -1
        ) {
          sentence = sentence.replace(/level(.*?):\s{0,}/i, '')
          console.log(sentence)
          const audio = await this.openAIService.createSpeech({
            model: 'tts-hd',
            input: sentence,
            voice: payload.voice,
            speed: payload.speed,
          })

          await this.phraseSentenceModel.create({
            grade: payload.grade,
            unit: payload.unit,
            phrase: phrase,
            sentence,
            voice: payload.voice,
            speed: payload.speed,
            audio: audio.toString('base64'),
          })
        }
      }
    }

    return true
  }
}
