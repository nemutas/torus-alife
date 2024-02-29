import * as Tone from 'tone'

class Sound {
  private soundControls = document.querySelector<HTMLElement>('.sound-controls')!
  private playBtn = this.soundControls.querySelector<HTMLButtonElement>('.sound-play')!

  private _bpm = 135
  private _volume = 50
  private _enable = true
  private volumeNode: Tone.Volume

  constructor() {
    this.volumeNode = this.createVolumeNode()
    this.on()
    this.visibleControls(true)

    this.setup().then(() => {
      this.addEvnets()
    })

    this.soundControls.querySelector<HTMLElement>('.bpm-value')!.innerText = this._bpm.toFixed(0)
    this.soundControls.querySelector<HTMLElement>('.volume-value')!.innerText = this._volume.toFixed(0)
  }

  private createVolumeNode() {
    return new Tone.Volume(this.volumeToDb(this._volume)).toDestination()
  }

  private createPlayer(sourceFileName: string) {
    return new Tone.Player({
      url: import.meta.env.BASE_URL + `sounds/${sourceFileName}.ogg`,
    }).connect(this.volumeNode)
  }

  private async setup() {
    Tone.Transport.bpm.value = this._bpm

    // https://learningmusic.ableton.com/ja/make-beats/rock-and-house.html
    const kick = this.createPlayer('Kick')
    // const oHat = this.createPlayer('OpenHat')
    const cHat = this.createPlayer('ClosedHat')
    const clap = this.createPlayer('Clap')

    await Tone.loaded()

    const schedule = (player: Tone.Player, start: Tone.Unit.Time, interval: Tone.Unit.Time) => {
      return new Tone.Loop((time) => player.start(time), interval).start(start)
    }

    // https://github.com/Tonejs/Tone.js/wiki/Time
    schedule(kick, '0:0:0', '4n')
    schedule(cHat, '2:0:2', '4n')
    schedule(clap, '2:3:0', '2n')
  }

  private addEvnets() {
    const onPlay = () => {
      if (!this._enable) return

      this.playBtn.classList.toggle('playing')

      if (this.isPlaying) {
        if (Tone.context.state === 'suspended') {
          Tone.context.resume().then(() => {
            Tone.Transport.start()
          })
        } else {
          Tone.Transport.start()
        }
      } else {
        Tone.Transport.pause()
      }
    }

    this.playBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      onPlay()
    })

    window.addEventListener('click', () => onPlay())

    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        // bpm
        this._bpm += e.code === 'ArrowRight' ? 5 : -5
        this._bpm = Math.min(Math.max(this._bpm, 50), 200)
        this.bpm = this._bpm
        this.soundControls.querySelector<HTMLElement>('.bpm-value')!.innerText = this._bpm.toFixed(0)
      }

      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        // volume
        this._volume += e.code === 'ArrowUp' ? 5 : -5
        this._volume = Math.min(Math.max(this._volume, 5), 100)
        this.volumeNode.volume.value = this.volumeToDb(this._volume)
        this.soundControls.querySelector<HTMLElement>('.volume-value')!.innerText = this._volume.toFixed(0)
      }
    })
  }

  private volumeToDb(v: number) {
    return (v - 100) * 0.2
  }

  get isPlaying() {
    return this.playBtn.classList.contains('playing')
  }

  get bpm() {
    return this._bpm
  }

  private set bpm(v: number) {
    Tone.Transport.bpm.rampTo(v, 1)
  }

  get seconds() {
    return Tone.Transport.seconds
  }

  get bpmToSeconds() {
    return this.seconds * (this.bpm / 60)
  }

  on() {
    this._enable = true
  }

  off() {
    this._enable = false
    Tone.Transport.pause()
  }

  get enabled() {
    return this._enable
  }

  visibleControls(v: boolean) {
    if (v) {
      this.soundControls.style.removeProperty('display')
    } else {
      this.soundControls.style.setProperty('display', 'none')
    }
  }
}

export const sound = new Sound()
