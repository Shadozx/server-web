const axios = require('axios').default
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const fs = require('fs')
async function getDescription(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    })
    const buf = response.data
    if (response.status == 200) {
      if (response.request.host.startsWith('loveread')) {
        if (response.request.host == 'loveread.me') {
          const html = buf.toString()
          const $ = cheerio.load(html)
          const description = $(
            '#content > div > div.blCenter > div.blTextBook > div:nth-child(1)'
          ).text()

          return description
            .replace(/\s+/g, ' ') // заменить длинные пробелы одним
            .replace(/^\s/, '') // удалить пробелы в начале строки
            .replace(/\s$/, '') // удалить пробелы в конце строки
        } else if (response.request.host == 'loveread.ec') {
          const html = iconv.decode(buf, 'windows-1251')
          const $ = cheerio.load(html, { decodeEntities: false })

          const description = $(
            'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > p.span_str'
          ).text()
          return description
          // .replace(/<[^>]+>/g, '')
          // .replace(/\s+/g, ' ') // заменить длинные пробелы одним
          // .replace(/^\s/, '') // удалить пробелы в начале строки
          // .replace(/\s$/, '') // удалить пробелы в конце строки
          // .replace(/&nbsp;/g, ' ')
        }
      } else {
        console.log('Силка не з того сайту який потрібен...')
        return null
      }
    } else {
      console.log('Проблема з відповіддю...')
      return null
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 *
 * @param {String} url
 * @returns {Promise<Map>}
 */
async function getInfo(url) {
  try {
    let response = await axios.get(url, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    })
    if (response.status == 200) {
      const buf = response.data
      let html = null,
        $
      let answer = new Map()

      let body = null

      // Провірка на сайт
      if (response.request.host.startsWith('loveread')) {
        if (response.request.host == 'loveread.me') {
          html = buf.toString()

          $ = cheerio.load(html, { decodeEntities: false })
          body = $('#content > div > div.textBook').html()
        } else if (response.request.host == 'loveread.ec') {
          html = iconv.decode(buf, 'windows-1251')
          $ = cheerio.load(html, { decodeEntities: false })
          body = $(
            'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td.tb_read_book > div:nth-child(4)'
          ).html()
        } else {
          return null
        }

        // Видалення знаку \n в тексті
        body = body.replace(/\n/g, '')
        fs.writeFileSync('t1.txt', body)
        let result = body.match(
          /(<p class=\"?.*?\"?>.*?<\/p>|<div class="take_h1">.*?<\/div>|<div class=\"?em\"?>.*?<\/div>)/g
        )

        // Обєднання послідовно декількох назв в одну
        let arr = []
        let s = []
        result.forEach(function (str, i) {
          arr.push(str)
          if (/<div class="take_h1">.*?<\/div>/.test(str)) {
            s.push({
              position: i,
              str,
              toString() {
                return str
              },
            })

            if (s.length == 3) {
              arr.splice(i - 2, 3, s.join('\n'))
              s = []
            }
          } else if (
            s.length != 0 &&
            !/<div class="take_h1">.*?<\/div>/.test(str)
          ) {
            if (s.length == 2 && s[1].position - s[0].position == 1) {
              arr.splice(i - 2, 2, s.join('\n'))
            }
            s = []
          }
        })

        result = arr
        arr = result
          .map((str) => str.replace(/<[^>]+>/g, ''))
          .filter((str) => /\S/.test(str))

        // Отримання назв розділів
        let sections = result
          .filter((str) => /<div class="take_h1">.*?<\/div>/.test(str))
          .map((str) => str.replace(/<[^>]+>/g, ''))

        if (sections.length) {
          // Формування назви розділу з її текстом
          sections.forEach((str, i) => {
            let index = arr.indexOf(str)
            if (index != 0) {
              let temp = arr.splice(0, index)

              if (sections.includes(temp[0])) {
                temp.splice(0, 1)
                answer.set(sections[i - 1], temp)
              } else {
                answer.set('0', temp)
              }
            }
          })
          if (arr.length) {
            let name = arr[0]
            arr.splice(0, 1)
            answer.set(name, arr)
          }
        } else {
          answer.set('0', arr)
        }

        return answer
      } else {
        console.log('Сталася проблема з витягом тексту...')
        return null
      }
    } else {
      console.log('Щось не так з відповіддю...')
      return null
    }
  } catch (e) {
    console.log(e.message)
  }
}

/**
 *
 * @param {String} url
 * @returns {Promise<Number>}
 */
async function getAmount(url) {
  const bookPage = url.split(/\/{1,2}|\?/g)

  bookPage.splice(bookPage.indexOf('view_global.php'), 1, 'read_book.php')
  const http = bookPage[0]
  const host = bookPage[1]
  const b = bookPage[2]
  const id = bookPage[3] + '&p=1'
  const searchingPath = http + '//' + host + '/' + b + '?' + id
  console.log(searchingPath)
  try {
    const response = await axios.get(searchingPath)

    if (response.status == 200) {
      let $ = cheerio.load(response.data)
      let navigation = []

      $ = cheerio.load($('div.navigation').html())
      $('a').each(function (i, el) {
        navigation.push($(this).text())
      })
      navigation = navigation.filter((i) => !isNaN(i))

      if (navigation.length) {
        const amount = +navigation.pop()

        return amount
      } else {
        console.log('Сталася помилка...')
        return 0
      }
    } else {
      console.log('Проблема з відповіддю і тому відповідь 0...')
      return 0
    }
  } catch (e) {
    console.log(e)
  }
}

async function getImage(url) {
  try {
    const response = await axios.get(url)

    if (response.status == 200) {
      if (response.request.host.startsWith('loveread')) {
        const $ = cheerio.load(response.data)
        if (response.request.host == 'loveread.me') {
          const src = $(
            '#content > div > div.blCenter > div.blAboutBook > a:nth-child(1) > img'
          ).attr('src')

          const link =
            response.request.protocol + '//' + response.request.host + '/' + src

          console.log(link)

          const img = await axios.get(link, { responseType: 'arraybuffer' })
          const data = img.data //.toString('base64')
          // console.log(data)
          return data
        } else if (response.request.host == 'loveread.ec') {
          const src = $(
            'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > p > a:nth-child(1) > img'
          ).attr('src')
          const link =
            response.request.protocol + '//' + response.request.host + '/' + src
          const img = await axios.get(link, { responseType: 'arraybuffer' })
          const data = img.data //.toString('base64')
          // console.log(data)
          return data
        } else {
          return null
        }
      } else {
        console.log('Силка не з потрібного сайту!')
        return null
      }
    } else {
      console.log('Проблема з відповіддю...')
      return null
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports.getInfo = getInfo
module.exports.getAmount = getAmount
module.exports.getDescription = getDescription
module.exports.getImage = getImage
