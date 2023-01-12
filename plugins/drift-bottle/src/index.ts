import { Context, Schema } from 'koishi'
import { resolve } from 'path'
import {} from '@koishijs/plugin-console'
import {handleUpload} from "./handle-upload";

declare module 'koishi' {
  interface User {
    bottle: {
      type: string
      content: string
      time: number
    }
  }
}
export const name = 'drift-bottle'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})
enum UserSeptStatus {
  startInput,
  inputType,
  endInput
}
export async function apply(ctx: Context) {
  ctx.model.extend('user', {
    bottle: 'json',
    jar: 'json',
  })

  // const user = await ctx.database.get('user',{})


  ctx.on('message',async (session)=>{
    // console.log('user',session.content)
    if(session.content==='清除'){
      await ctx.database.set('user',session.user.id,{...ctx.user,bottle:{}})
      session.send('清除成功')
      return;
    }
    if(session.content==='状态'){
     const content = await ctx.database.get('user',session.user.id)
      console.log(content)
      // session.send('清除成功')
      return;
    }

    if(session.content === '扔瓶子'){
      const newBottle= {
        type: '',
        content: '',
        time: 0,
        septStatus: UserSeptStatus.startInput,
        adding:true
      }
      await ctx.database.set('user', {id: Number(session.user.id)},
        {bottle: newBottle})
      return  session.send('请输入瓶子内容')
    }
  })
  ctx.on('message',async (session)=>{
    const users = await ctx.database.get('user',{id:session.user.id})
    console.log('users',users)
    const user = users[0]|| null
    if(!user)return

    if(user.bottle && user.bottle.adding){
      console.log('handing')

      session.send(await handleUpload(session, ctx.database))
    }
  })
  ctx.on('message', (session) => {
    if (session.content === '捞瓶子') {
      // session.send(handleTake(session.content,ctx.database))
    }
  })
  ctx.using(['console'], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist'),
    })
  })
}
