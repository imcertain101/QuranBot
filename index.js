const Discord = require('discord.js');
const ytdl = require('ytdl-core-discord');
const yts = require('yt-search');
const keep_alive = require('./keep_alive.js')
const { getVoiceConnection } = require('@discordjs/voice');
Client = Discord.Client;
Intents = Discord.Intents;
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const music = require('@discordjs/voice');
const { getInfo } = require('discord-ytdl-core');
const { forEach } = require('lodash');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const token = process.env['token'];
const PREFIX = "+";
let player;

let que = [];
let diff = [];
let playing = false;
let vc = false;
var cool = true;

let cd;
let msg;


bot.on('ready', () => {
  console.log('bot online');
})
bot.on('messageCreate', message => {
  const args = message.content.substring(PREFIX.length).split(" ")
  if (message.content.substring(0, PREFIX.length) == '+') {
    switch (args[0]) {
      case 'play':
        if (!args[1]) {
          message.channel.send('give me a yt link dumbass');
          return;
        }

        if (message.member.voice.channelId == null) {
          message.channel.send('get in a vc mate');
          return;
        } else {
          if (ytdl.validateURL(args[1])) {
            if (getVoiceConnection(message.guild.id) != null) {
              getQue(message.guild.id).push(args[1]);
            }
            if (getVoiceConnection(message.guild.id) == null && message.member.voice.channel.id != null) {
              diff[diff.length] = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
              });
              diff[diff.length] = message.guild.id;
              diff[diff.length] = [];
              diff[diff.length - 1].push(args[1]);
              diff[diff.length] = createAudioPlayer();
              const player = diff[diff.length - 1]
              player.on(music.AudioPlayerStatus.Idle, () => {
                if (getQue(message.guild.id).length == 0) {
                  getCon(message.guild.id).destroy();
                }
                else {
                  next(message);
                }

              });
              msg = message;
              vc = true;
              next(message);
            }
          }
          else {
            msg = message;
            if (!cool) {
              cool = true;
            }
            videosearch(message.content.substring(5))

          }

        }

        break;
      case 'stop':
        if (getVoiceConnection(message.guild.id) != null) {
          getCon(message.guild.id).destroy();
          removeall(message.guild.id);
        }

        break;

      case 'queue':
        if (getVoiceConnection(message.guild.id) != null) {
          queue(message);
          break;

        }

      case 'skip':
        if (getQue(message.guild.id) == null && getVoiceConnection(message.guild.id) != null) {
          message.channel.send('nothing to skip to... disconnecting');
          getCon(message.guild.id).destroy()
          playing = false;
          return;
        }
        else if (getVoiceConnection(message.guild.id) != null && getQue(message.guild.id)[0] != null) {
          next(message);
        }

        break;
      case 'pray':
        message.channel.send('bismillah wallahi astaghfirullah isalamek asalam alaykum allahu akbar');

        break;
      case 'prayA':
        message.channel.send('بسم الله ربي استغفر الله اسلامك' + ' اسلامك السلام عليكم الله اكبر');
        break;
      case 'ez4ants':
        if (message.member.voice.channelId == null) {
          message.channel.send('get in a vc mate');
          return;
        } else {
          if (true) {
            if (getVoiceConnection(message.guild.id) != null) {
              getQue(message.guild.id).unshift('https://www.youtube.com/watch?v=h7u7OKMcI-Y');
              console.log(getQue(message.guild.id));
              next(message);

            }
            if (getVoiceConnection(message.guild.id) == null && message.member.voice.channel.id != null) {
              diff[diff.length] = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
              });
              diff[diff.length] = message.guild.id;
              diff[diff.length] = [];
              diff[diff.length - 1].unshift('https://www.youtube.com/watch?v=h7u7OKMcI-Y');
              diff[diff.length] = createAudioPlayer();
              const player = diff[diff.length - 1]
              player.on(music.AudioPlayerStatus.Idle, () => {
                if (getQue(message.guild.id).length == 0) {
                  getCon(message.guild.id).destroy();
                }
                else {
                  next(message);
                }

              });
              msg = message;
              vc = true;
              next(message);
            }
          }
        }

        break;

    }

  }

});
var vids;
async function videosearch(t) {
  const r = await yts(t);
  vids = r.videos.slice(0, 3);

  var num = 1;
  vids.forEach(function(v) {
    const views = String(v.views).padStart(10, ' ')
    msg.channel.send(num + '. ' + `${views} | ${v.title} (${v.timestamp}) | ${v.author.name}`);
    num++;
  })
  playingthings();


  return;

}
let prev = '';
function playingthings() {
  console.log('video');
  bot.on('messageCreate', async (m) => {
    if (msg.author.id == m.author.id) {
      if (m.content == '1') {
        var newvid = 'https://www.youtube.com/watch?v=' + vids[0].videoId;
        if (getVoiceConnection(m.guild.id) != null && (prev != m.id)) {
          prev = m.id
          getQue(m.guild.id).push(newvid);
          return;
        }
        if (getVoiceConnection(m.guild.id) == null & m.member.voice.channel.id != null) {
          prev = m.id;
          diff[diff.length] = joinVoiceChannel({
            channelId: m.member.voice.channel.id,
            guildId: m.guild.id,
            adapterCreator: m.guild.voiceAdapterCreator,
          });
          diff[diff.length] = m.guild.id;
          diff[diff.length] = [];
          diff[diff.length - 1].push(newvid);
          cd = diff[diff.length - 3];
          diff[diff.length] = createAudioPlayer();
          const player = diff[diff.length - 1]
          player.on(music.AudioPlayerStatus.Idle, () => {
            if (getQue(m.guild.id).length == 0) {
              getCon(m.guild.id).destroy();
            }
            else {
              next(m);
            }

          });
          vc = true;
          next(m);
        }
        return;
      }
      else if (m.content == '2') {
        var newvid = 'https://www.youtube.com/watch?v=' + vids[1].videoId;
        if (getVoiceConnection(m.guild.id) != null && (prev != m.id)) {
          prev = m.id
          getQue(m.guild.id).push(newvid);
          return;
        }
        if (getVoiceConnection(m.guild.id) == null & m.member.voice.channel.id != null) {
          diff[diff.length] = joinVoiceChannel({
            channelId: m.member.voice.channel.id,
            guildId: m.guild.id,
            adapterCreator: m.guild.voiceAdapterCreator,
          });
          diff[diff.length] = m.guild.id;
          diff[diff.length] = [];
          diff[diff.length - 1].push(newvid);
          cd = diff[diff.length - 3];
          diff[diff.length] = createAudioPlayer();
          const player = diff[diff.length - 1]
          player.on(music.AudioPlayerStatus.Idle, () => {
            if (getQue(m.guild.id).length == 0) {
              getCon(m.guild.id).destroy();
            }
            else {
              next(m);
            }

          });
          vc = true;
          next(m);
        }
        return;
      }
      else if (m.content == '3') {
        var newvid = 'https://www.youtube.com/watch?v=' + vids[2].videoId;
        if (getVoiceConnection(m.guild.id) != null && (prev != m.id)) {
          prev = m.id
          getQue(m.guild.id).push(newvid);
          return;
        }
        if (getVoiceConnection(m.guild.id) == null & m.member.voice.channel.id != null) {
          diff[diff.length] = joinVoiceChannel({
            channelId: m.member.voice.channel.id,
            guildId: m.guild.id,
            adapterCreator: m.guild.voiceAdapterCreator,
          });
          diff[diff.length] = m.guild.id;
          diff[diff.length] = [];
          diff[diff.length - 1].push(newvid);
          cd = diff[diff.length - 3];
          diff[diff.length] = createAudioPlayer();
          const player = diff[diff.length - 1]
          player.on(music.AudioPlayerStatus.Idle, () => {
            if (getQue(m.guild.id).length == 0) {
              getCon(m.guild.id).destroy();
            }
            else {
              next(m);
            }

          });
          vc = true;
          next(m);
        }
        return;
      }
    }
    return;
  });
}

async function skip(mt) {
  var stream = await ytdl(que[0], { filter: 'audioonly', type: 'opus', highWaterMark: 1 << 25 });
  const resource = createAudioResource(stream);
  player.play(resource);
  getQue(mt.guild.id).shift()
}

async function queue(message) {
  if (getQue(message.guild.id).length == 0) {
    message.channel.send('nothing in que rn');
    return;
  }
  message.channel.send('Queue: ');
  for (i = 0; i < getQue(message.guild.id).length; i++) {
    const info = await ytdl.getInfo(getQue(message.guild.id)[i]);
    message.channel.send((i + 1) + '. ' + info.videoDetails.title);
  }

}

async function next(mt) {
  if (mt != null) {
    var stream = await ytdl(getQue(mt.guild.id)[0], { filter: 'audioonly', type: 'opus', highWaterMark: 1 << 25 });
    console.log('streaming');
    const resource = createAudioResource(stream);
    getCon(mt.guild.id).subscribe(getPl(mt.guild.id));
    getPl(mt.guild.id).play(resource);
    getQue(mt.guild.id).shift()
  }

}

function getQue(id) {
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] == id) {
      return diff[i + 1];
    }
  }
}

function getCon(id) {
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] == id) {
      return diff[i - 1];
    }
  }
}

function getPl(id) {
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] == id) {
      return diff[i + 2];
    }
  }
}

function removeall(id) {
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] == id) {
      diff.splice(i, 1)
      diff.splice(i - 1, 1)
      diff.splice(i + 1, 1)
      diff.splice(i + 2, 1)
    }
  }
}



bot.login(token);
