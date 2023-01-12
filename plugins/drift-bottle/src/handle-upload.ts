import {DatabaseService, Session,User} from "koishi";

enum UserSeptStatus {
  startInput,
  inputType,
  endInput
}
declare module '@satorijs/core' {
  interface CustomUser {
    bottle?: {
      type: string
      content: string
      time: number
      septStatus: UserSeptStatus
      adding: boolean
    }
  }
  namespace User {
    type Field = keyof User & CustomUser;
    const fields: Field[];
  }
}

export async function handleUpload(session: Session,db:DatabaseService):string{
  // 扔瓶子->请输入瓶子内容 map[user_id]={status:'start input',type:?,content:''}
  // 请输入类型-> map[user_id]={status:'input type',type:?,content:'content'}
  // 请输入内容-> map[user_id]={status:'input content',type:'zhen xin hua',content:'content'}
  const users = await db.get('user',{id:session.user.id});
  const user = users[0]
  console.log('user',user)

  console.log(user.bottle.septStatus === UserSeptStatus.startInput)
  if(user.bottle.septStatus === UserSeptStatus.startInput){
    const newBottle= {
      ...user.bottle,
      content: session.content,
      septStatus: UserSeptStatus.inputType,
      adding: true
    }
    // console.log('newBottle',newBottle)
    await db.set('user', {id: Number(session.user.id)},
      {bottle: newBottle})
    const newUser = await db.get('user',{id:session.user.id})
    console.log('newUser',newUser)
    return '请输入类型'
  }

  if(user.bottle.septStatus === UserSeptStatus.inputType){
    const newBottle= {
      ...user.bottle,
      type: session.content,
      septStatus: UserSeptStatus.endInput,
      adding: false
    }
    const oldJar = Array.isArray(user.jar) ? user.jar : []
    const newJar = oldJar.concat([
     newBottle
    ])
    console.log('newBottle',newBottle)
    await db.set('user', {id: Number(session.user.id)},
      {bottle: newBottle,jar:newJar})
    return '完成输入'
  }
  return '未匹配'
}
