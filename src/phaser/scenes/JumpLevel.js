import Phaser from 'phaser'
import { scoreChanged, gameOver } from '../score'

const wonGame = false
const life = []
let tornado
let isAlive = true
let right = true
let jumpUp = false
let scoreText
let canAsk = false
let noQuestion
let jumpSceneComplete = false
let facing = ''
let react
let check
let tutor
let player
let platforms
let floor
let wall
let enemyWall
let trigger
let ent
let lives
const worldWidth = 2000
let checkText
let checkAmount = 0
const checksToPass = 2
let currentSceneScore
let startingScore
let explode

const walkFalse = () => {
  right = false
}
const walkRight = () => {
  setTimeout(walkFalse, 5000)
}

const walkTrue = () => {
  right = true
}
const walkLeft = () => {
  setTimeout(walkTrue, 5000)
}

const airUp = () => {
  if (!jumpUp) {
    jumpUp = true
  }
}

const airDown = () => {
  jumpUp = false
}

const bounce = () => {
  airUp()
  setTimeout(airDown, 500)
  setTimeout(() => {
  }, 2500)
}

/**
 *
 * @param {Phaser.Scene} scene
 * @param {number} totalWidth
 * @param {string} texture
 * @param {number} scrollFactor
 */
const createAligned = (scene, totalWidth, texture, scrollFactor) => {
  const getWidth = scene.textures.get(texture).getSourceImage().width
  const count = Math.ceil(totalWidth / getWidth) * scrollFactor
  let x = 0
  for (let i = 0; i < count; ++i) {
    const m = scene.add
      .image(x, scene.scale.height, texture)
      .setOrigin(0, 1)
      .setScrollFactor(scrollFactor)

    x += m.width
  }
}
const collectScore = (player, type) => {
  if (type.texture.key === 'react') {
    type.disableBody(true, true)
    currentSceneScore += 10
    scoreChanged(currentSceneScore)
    scoreText.setText('Score: ' + currentSceneScore)
  } else {
    type.disableBody(true, true)
    currentSceneScore += 20
    checkAmount += 1
    scoreChanged(currentSceneScore)
    scoreText.setText('Score: ' + currentSceneScore)
    checkText.setText('Trello: ' + checkAmount + ' / ' + checksToPass)
    if (checkAmount === checksToPass) {
      canAsk = true
    }
  }
}

const askQuestion = () => {
  if (canAsk) {
    noQuestion.setText('  Congrats, you have\n\ncompleted your trello card!')
    setTimeout(() => {
      jumpSceneComplete = true
    }, 2000)
  } else {
    noQuestion.setText('Please come back with\n\n a complete trello card')
  }
}

export default class JumpLevel extends Phaser.Scene {
  constructor () {
    super('jump-scene')
  }

  // ////////////////////////////////////PRELOAD/////////////////////////////////////////////////
  preload () {
    // invis walls/triggers
    this.load.image('triggerBlock', 'assets/blocksTriggers/triggerBlock.png')
    this.load.image('base', '/assets/blocksTriggers/base.png')
    this.load.image('wallBlock', '/assets/blocksTriggers/wallBlock.png')
    this.load.image('wallBlockEnemy', '/assets/blocksTriggers/wallBlock.png')

    // tutor
    this.load.image('lane', '/assets/man/lane.png')
    // assets
    this.load.image('reactText', '/assets/coinsText.png')
    this.load.image('checkText', '/assets/checkText.png')
    this.load.image('check', '/assets/check.png')
    this.load.image('react', '/assets/reactCoinP.png')
    this.load.image('platform', '/assets/Jungle/platform.png')
    this.load.image('bump', '/assets/Jungle/bump.png')
    this.load.image('sky', '/assets/Jungle/sky.png')
    this.load.image('mountain', '/assets/Jungle/mountains.png')
    this.load.image('plateau', '/assets/Jungle/plateau.png')
    this.load.image('ground', '/assets/Jungle/ground.png')
    this.load.image('arrow-keys', '/assets/left-right-keys.png')
    this.load.image('up-key', '/assets/up-key.png')
    this.load.image('lives', '/assets/Game/lives-icon.png')
    this.load.image('tutor', '/assets/man/lane.png')
    this.load.image(
      'platform',
      '/assets/airpack/PNG/Environment/ground_grass.png'
    )
    this.load.image('plants', '/assets/Jungle/plant.png')
    this.load.image('information', '/assets/PNG/tornado_text.png')

    // Tornado load
    this.load.spritesheet('tornado', '/assets/PNG/tornado.png', {
      frameWidth: 28.8333,
      frameHeight: 42
    })

    // player assets
    this.load.spritesheet('jumpRight', '/assets/man/jumpRight.png', {
      frameWidth: 60,
      frameHeight: 105
    })
    this.load.spritesheet('jumpLeft', '/assets/man/jumpLeft.png', {
      frameWidth: 60,
      frameHeight: 105
    })
    this.load.spritesheet('runLeft', '/assets/man/runLeft.png', {
      frameWidth: 63,
      frameHeight: 99
    })
    this.load.spritesheet('runRight', '/assets/man/runRight.png', {
      frameWidth: 63,
      frameHeight: 99
    })
    this.load.spritesheet('idleRight', '/assets/man/idleRight.png', {
      frameWidth: 57,
      frameHeight: 102
    })
    this.load.spritesheet('idleLeft', '/assets/man/idleLeft.png', {
      frameWidth: 57,
      frameHeight: 102
    })

    this.load.spritesheet('explode', '/assets/Game/explosion.png', {
      frameWidth: 125.4,
      frameHeight: 107
    })

    // ent enemy assets
    this.load.spritesheet('walkRight', '/assets/PNG/ent/walk-right.png', {
      frameWidth: 99,
      frameHeight: 103
    })
    this.load.spritesheet('walkLeft', '/assets/PNG/ent/walk-left.png', {
      frameWidth: 99,
      frameHeight: 103
    })

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  // ////////////////////////////////////CREATE/////////////////////////////////////////////////
  create (prevLevel) {
    currentSceneScore = prevLevel.currentSceneScore
    startingScore = currentSceneScore
    lives = prevLevel.lives
    this.input.keyboard.on('keydown-' + 'LEFT', function (event) {
      facing = 'left'
    })
    this.input.keyboard.on('keydown-' + 'RIGHT', function (event) {
      facing = 'right'
    })

    const width = this.scale.width
    const height = this.scale.height
    const totalWidth = width * 10

    this.add.image(width * 0.5, height * 0.5, 'sky').setScrollFactor(0).setScale(2)

    createAligned(this, totalWidth, 'mountain', 0.15)
    createAligned(this, totalWidth, 'plateau', 0.5)
    createAligned(this, totalWidth, 'ground', 1)
    createAligned(this, totalWidth, 'plants', 1.25)

    // Collider floor & platforms

    wall = this.physics.add.staticGroup()
    wall.create(-10, 0, 'wallBlock')
    wall.create(worldWidth, 0, 'wallBlock')

    enemyWall = this.physics.add.staticGroup()
    enemyWall.create(1500, 400, 'wallBlockEnemy')
    enemyWall.create(500, 400, 'wallBlockEnemy')

    floor = this.physics.add.staticGroup()
    floor.create(2010, 648, 'base').setScrollFactor(0)

    // background images
    this.add.image(250, 275, 'information').setScale(0.4)
    // Character sprites

    // Tutor
    tutor = this.physics.add.staticImage(1800, 588, 'lane').setScale(0.3).refreshBody()

    // Tutor trigger

    const spot = tutor.body.position

    trigger = this.physics.add.sprite(spot.x, spot.y, 'triggerBlock')

    // Player sprite

    player = this.physics.add.sprite(100, 580, 'idleRight')
    player.body.setGravityY(30)
    player.setCollideWorldBounds(false)
    // player.onWorldBounds = true
    player.body.checkCollision.up = false

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('runLeft', {
        start: 7,
        end: 0
      }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('runRight', {
        start: 0,
        end: 7
      }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'idleRight',
      frames: this.anims.generateFrameNumbers('idleRight', {
        start: 0,
        end: 11
      }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'idleLeft',
      frames: this.anims.generateFrameNumbers('idleLeft', {
        start: 0,
        end: 11
      }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'jumpLeft',
      frames: this.anims.generateFrameNumbers('jumpLeft', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'jumpRight',
      frames: this.anims.generateFrameNumbers('jumpRight', {
        start: 0,
        end: 2
      }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNumbers('explode', {
        start: 0,
        end: 16
      }),
      frameRate: 24

    })
    // Amount of Lives display
    this.getLivesCount()

    // Explosion animation

    // Enemy Sprites
    ent = this.physics.add.sprite(800, 400, 'walkRight')
    ent.setScale(3.7)
    ent.body.setGravityY(80)
    // ent.setCollideWorldBounds(true)
    ent.onWorldBounds = true
    ent.body.checkCollision.up = true
    ent.body.checkCollision.left = true
    ent.body.checkCollision.right = true
    // this.physics.add.overlap(ent, player, bounce, null, this)
    this.physics.add.overlap(ent, player, this.death, null, this)
    // this.physics.add.collider(ent, floor, walk, null, this)

    this.anims.create({
      key: 'entLeft',
      frames: this.anims.generateFrameNumbers('walkLeft', {
        start: 0,
        end: 4
      }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'entRight',
      frames: this.anims.generateFrameNumbers('walkRight', {
        start: 0,
        end: 4
      }),
      frameRate: 10,
      repeat: -1
    })
    // Interactive Sprites

    // Tornado create

    tornado = this.physics.add.sprite(40, 200, 'tornado')
    tornado.setScale(2.5)
    tornado.setImmovable = true
    tornado.onWorldBounds = true
    tornado.body.checkCollision.up = true
    tornado.body.checkCollision.left = true
    tornado.body.checkCollision.right = true
    tornado.body.checkCollision.down = true
    // whirlwind
    this.anims.create({
      key: 'whirl',
      frames: this.anims.generateFrameNumbers('tornado', {
        start: 6,
        end: 0
      }),
      frameRate: 10,
      repeat: -1
    })

    this.physics.add.overlap(player, tornado, bounce, null, this)

    // coin and collection

    react = this.physics.add.staticGroup()
    react.create(360, 600, 'react').setScale(0.05).refreshBody()
    react.create(536, 150, 'react').setScale(0.05).refreshBody()
    react.create(536, 200, 'react').setScale(0.05).refreshBody()
    react.create(536, 250, 'react').setScale(0.05).refreshBody()
    react.create(536, 300, 'react').setScale(0.05).refreshBody()
    react.create(536, 350, 'react').setScale(0.05).refreshBody()
    react.create(536, 400, 'react').setScale(0.05).refreshBody()
    react.create(536, 450, 'react').setScale(0.05).refreshBody()
    react.create(1000, 550, 'react').setScale(0.05).refreshBody()
    react.create(1200, 550, 'react').setScale(0.05).refreshBody()
    react.create(1400, 550, 'react').setScale(0.05).refreshBody()

    react.create(1800, -100, 'react').setScale(0.05).refreshBody()
    react.create(1600, 0, 'react').setScale(0.05).refreshBody()
    react.create(1600, 100, 'react').setScale(0.05).refreshBody()
    react.create(1600, 200, 'react').setScale(0.05).refreshBody()
    react.create(1600, 300, 'react').setScale(0.05).refreshBody()
    react.create(1600, 400, 'react').setScale(0.05).refreshBody()

    this.physics.add.overlap(player, react, collectScore, null, this)
    this.physics.add.overlap(player, trigger, askQuestion, null, this)

    check = this.physics.add.staticGroup()
    check.create(1400, 550, 'check').setScale(0.08).refreshBody()
    check.create(800, 550, 'check').setScale(0.08).refreshBody()

    this.physics.add.overlap(player, check, collectScore, null, this)
    this.physics.add.overlap(player, trigger, askQuestion, null, this)

    // camera follow
    this.cameras.main.setBounds(0, 0, worldWidth, 0)
    this.cameras.main.startFollow(player)

    // text
    scoreText = this.add
      .text(16, 16, 'Score: ' + currentSceneScore, {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '20px',
        fill: 'white'
      })
      .setScrollFactor(0)

    checkText = this.add
      .text(width - 300, 16, 'Trello: 0 / ' + checksToPass, {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '20px',
        fill: 'white'
      })
      .setScrollFactor(0)

    noQuestion = this.add.text(spot.x - 200, spot.y - 120, '', {
      fontFamily: "'Press Start 2P', cursive",
      fontSize: '15px',
      fill: 'white'
    })

    // colliders
    this.physics.add.collider(floor, [player, ent, react, tutor, trigger, tornado])
    this.physics.add.collider(player, [platforms, ent, wall, tornado, player])
    this.physics.add.collider(ent, [platforms, ent, enemyWall, wall])
    this.physics.add.collider(tornado, [platforms, enemyWall, wall, tornado])
  }

  // ////////////////////////////////////UPDATE/////////////////////////////////////////////////
  update () {
    const cam = this.cameras.main
    const speed = 15

    // Player
    if (this.cursors.left.isDown) {
      // facing = 'left'
      player.setVelocityX(-300)
      cam.scrollX -= speed
      if (!player.body.touching.down) {
        player.anims.play('jumpLeft', true)
      } else {
        player.anims.play('left', true)
      }
    } else if (this.cursors.right.isDown) {
      // facing = 'right'
      player.setVelocityX(300)
      cam.scrollX += speed
      if (!player.body.touching.down) {
        player.anims.play('jumpRight', true)
      } else {
        player.anims.play('right', true)
      }
    } else if (!player.body.touching.down && facing === 'left') {
      player.anims.play('jumpLeft', true)
    } else if (!player.body.touching.down && facing === 'right') {
      player.anims.play('jumpRight', true)
    } else if (facing === 'left') {
      player.setVelocityX(0)
      player.anims.play('idleLeft', true)
    } else {
      player.setVelocityX(0)
      player.anims.play('idleRight', true)
    }
    if (this.cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-150)
      if (facing === 'left') {
        player.anims.play('jumpLeft', true)
      } else player.anims.play('jumpRight', true)
    }
    //   Tornado
    if (jumpUp) {
      player.setVelocityY(-500)
      if (facing === 'left') {
        player.anims.play('jumpLeft', true)
      } else player.anims.play('jumpRight', true)
    }
    if (tornado) {
      tornado.anims.play('whirl', true)
      tornado.setVelocityX(100)
    }

    if (tornado.body.y > 1600) {
      tornado.setY(500)
      tornado.setX(40)
    }
    // next level
    if (jumpSceneComplete) {
      this.scene.start('question-two', { currentSceneScore, lives })
    }
    // enemy ENT
    if (ent.body.blocked.right || !right) {
      walkLeft()
      ent.body.velocity.x = -100
      ent.anims.play('entLeft', true)
    }
    if (right) {
      walkRight()
      ent.body.velocity.x = 100
      ent.anims.play('entRight', true)
    }

    // DEATH ANIMATION

    explode = this.add.sprite(player.body.position.x + 50, player.body.position.y + 45, 'explode')
    explode.setScale(1.4)
  }

    getLivesCount = () => {
      for (let i = 0; i < lives; i++) {
        let x = 400
        x = x + (i * 80)
        life[i] = this.add.image(x, 30, 'lives').setScale(0.5).setScrollFactor(0)
      }
    }

    // DEATH
    death = () => {
      lives = lives - 1
      isAlive = false
      explode.anims.play('death', true)
      player.disableBody(true, true)
      checkAmount = 0
      setTimeout(() => {
        life[lives].destroy()
      }, 100)
      setTimeout(() => {
        if (lives > 0) {
          this.getLivesCount()
          this.scene.restart({ currentSceneScore: startingScore, lives })
        } else if (lives === 0) {
          life[lives].destroy()
          this.getLivesCount()
          gameOver({ isAlive, wonGame, currentSceneScore, level: 'Jungle' })
        }
      }, 2000)
    }
}
