import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { Post } from '../entities/post.entity';
import { Image } from '../entities/image.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Image) private readonly imageRepo: Repository<Image>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
  ) {}

  async seed() {
    await this.categoryRepo.delete({});
    await this.postRepo.delete({});
    await this.imageRepo.delete({});
    await this.commentRepo.delete({});
    await this.likeRepo.delete({});
    await this.userRepo.delete({});

    const admin = this.userRepo.create({
      email: 'WF_ADMIN',
      name: 'WF_ADMIN',
      oauth2_sub: '',
    });
    await this.userRepo.save(admin);

    const guest = this.userRepo.create({
      email: 'WF_GUEST',
      name: 'WF_GUEST',
      oauth2_sub: '',
    });
    await this.userRepo.save(guest);

    const category1 = this.categoryRepo.create({
      title: 'Üdv a Wayfarer-en 👋',
      creator: admin,
    });
    await this.categoryRepo.save(category1);

    const post5 = new Post();
    post5.title = 'Névjegy';
    post5.slug = 'nevjegy';
    post5.body = `Helló, kösz hogy mindegyik bejegyzésen végigkattintottál. Fabók Árpád informatikus vagyok és ha kíváncsi vagy a többi munkámra is akkor megtalálhatsz a https://www.fabokarpad.hu weboldalon. Ide töltöm fel a portfóliós és egyéb említésre méltó projektjeimet, illetve ha érdekel az ilyesmi akkor itt találod a képesítéseimet és az elérhetőségemet is. Néha megesik, hogy a szabadidőmben efféle projekteket csinálok a saját jobb belátásom ellenére.`;
    post5.uploader = admin;
    post5.category = category1;

    await this.postRepo.save(post5);

    const post4 = new Post();
    post4.title = 'Technikai részletek, függőségek, telepítés';
    post4.slug = 'technikai-reszletek-fuggosegek-telepites';
    post4.body = `Ja, és ne tudd meg mennyit kellett szenvednem mire működésbe tudtam hozni ezt az oldalt a Vercelen. Kellett nekem egy egzotikus monorepóval szórakoznom 🙄...
          Először is a backend Typescriptben van megírva amit először össze kell állítani Javascriptté és azt külön feltölteni mert NodeJs projekteknél csak azt tudja futtatni a platform. (Ez inkább a régi Fastify szervernél volt probléma, a Nestet már jobban meg tudja emészteni.) Ezen túl Express helyett Fastify-t használok, amit egy külön default exportált metódussal kell ellátni, hogy a megfelelő belépési ponton tudja futtatni mint serverless functiont.
          Ezek után kell még egy vercel.json nevű konfigurációs fájl is mind a backend, mind a frontend könyvtárába ami többek közt átirányítja a webkéréseket hogy SPA oldalként tudjon működni, illetve hogy fejléceket állítson be a CORS miatt. Ha egy felhő alapú platformot használsz mint a Vercel akkor először minden kimenő hívás rajtuk megy keresztül, ami külön tervezést igényel.
          Ja, és amikor még a backend az adatbázissal Prisma ORM-en keresztül kommunikált azt is újra kellett migrálni minden build parancs elején a platform oldalon hogy biztos szinkronban legyen a DB-vel...
          És még valamiért az Angular frontendnek is külön meg kell adni, hogy milyen mappában keresse a lefordított kész fájlokat. (Alapvetően a 'dist/<project könyvtár>/browser' helyre fordít az ng build parancs, de ezt a Vercel nem feltételezi alapból, ne kérdezd miért.)
          Talán most már működik 🤞.`;
    post4.uploader = admin;
    post4.category = category1;

    await this.postRepo.save(post4);

    const comment4_1 = new Comment();
    comment4_1.message = `Ami a függőségeket illeti, meglepően nincs is olyan sok belőlük. Először is a böngészőből szervernek küldött kéréseket az Axios könyvtáron keresztül intézi az oldal. A felugró ablakokhoz (bár a többsége inkább "leugró") egy ngx-modal-ease nevű csomagot használ, a poszt lista lapozhatóvá tételéhez ngx-pagination-t, illetve a Google fiókos bejelentkezésért az angular-oauth2-oidc nevű csomag felel.
          Ezeken túl még egy ngx-linky nevű könyvtárat is használok ami automatikusan linkekké változtatja a posztokban szereplő email címeket, weboldal url-eket, stb., valamint egyéb kisebb ikonok is be lettek importálva az ng-icons könyvtárból. De amúgy lényegében ennyi az egész. Ja, és még a Vercel Blob adattárolóját is használom, hogy a feltöltött képeket ideiglenesen ott tároljam amíg a Medea el nem intézi a többit.`;
    comment4_1.user = admin;
    comment4_1.post = post4;

    await this.commentRepo.save(comment4_1);

    const comment4_2 = new Comment();
    comment4_2.parent = comment4_1;
    comment4_2.message = `A Google beléptetéshez eredetileg az abacritt féle angularx-social-login könyvtárral próbálkoztam mivel az első visszajelzések szerint ez a közkedvelt megoldás erre a feladatra. Azonban mint kiderült ennek a csomagnak van egy olyan kisebb szépséghibája (bug?), hogy az oldal újratöltésekor elveszik a bejelentkezési token és a felhasználónak újra be kell lépnie a Google fiókjába, így áttértem egy robosztusabb megoldásra.`;
    comment4_2.user = admin;
    comment4_2.post = post4;

    await this.commentRepo.save(comment4_2);

    const post3 = new Post();
    post3.title = 'Szóval hogyan is működik ez?';
    post3.slug = 'szoval-hogyan-is-mukodik-ez';
    post3.body = `Hogyha a felhasználói utasításokra vagy kíváncsi, akkor attól tartok csak azt tudom itt megismételni, amit az első posztomban írtam. Ha a techno-hablatyra is kíváncsi vagy akkor olvass tovább.
          Maga a frontend oldal (amit most látsz) Angular 17+ keretrendszerrel készült ami TypeScriptet és SCSS stíluslapokat használ. A szerver rész ami fogadja a felhasználói kéréseket egy Nest.js-ben írt REST API ami egy PostgreSQL adatbázissal kommunikál TypeORM-en keresztül. 
          A Nest egy Angular-hez nagyon hasonló API keretrendszer, a TypeORM pedig az alapértelmezett adatbázis letérképező technológiája amivel összeköti a Javascriptet az SQL táblákkal. (Eredetileg ez Fastify volt Prismával, de aztán ezt lecseréltem Fastify alapú Nestre, ami, hogy őszinte legyek egy kevésbé elterjedtebb és kevésbé dokumentáltabb konfiguráció, de hát ezzel kell élni.)
          Ez a szerver minden kliens oldali kérés válaszához egy cookie-t és egy saját fejlécet csatol amivel beazonosítja a felhasználót aki a kérést intézte (vendég vagy bejelentkezett). Ez alapján tudja a böngésző összehasonlítani, hogy pl. az adott poszt szerzője van-e bejelentkezve.
          Az egész projekt nyílt forrású, ha érdekel a forráskód akkor itt megtalálhatod, mindkét projekt egy közös monorepo-ban van: https://www.github.com/FarpadGit/Wayfarer`;
    post3.uploader = admin;
    post3.category = category1;

    await this.postRepo.save(post3);

    const comment3_1 = new Comment();
    comment3_1.message = `Amikor létrehozol egy új kommentet (vagy szerkeszted, törlöd, stb.) akkor ezt a változást a böngésző először elküldi a szerver oldali adatbázisnak, de már nem várja meg a válaszát, azonnal helyben elvégzi a változást anélkül hogy a többi kommentet újratöltené. Ez nélkülönhetetlen a zökkenőmentes felhasználói élményért, 
            különben minden gombnyomás után egy betöltő animációt látnál, hiszen fizikailag elég messze van a szerver. Új posztok vagy járások (kategóriák) létrehozásakor azonban ez kicsit másképp működik, ekkor valóban kér egy teljes újralekérdezést az összes releváns adatról miután a beszúrás/törlés megtörtént.
            Ez főleg a listanézet lapozhatóságát szolgálja. (A jelenlegi beállítás az, hogy 6 posztot látsz oldalanként, legújabbtól a legrégebbig, és sok logisztikai fejfájást okozna ha ezek nem lennének teljesen szinkronban az adatbázis tartalmával.) 
            És természetesen egy poszt megnyitásakor szintén szinkronba kerülsz a szerver oldali állapottal, vagyis rendesen lekérdezi az összes kommentet és lájkot.`;
    comment3_1.user = admin;
    comment3_1.post = post3;

    await this.commentRepo.save(comment3_1);

    const comment3_2 = new Comment();
    comment3_2.parent = comment3_1;
    comment3_2.message = `És igen, ezeket a bemutatkozó posztokat is hátulról előre töltöttem fel hogy a legújabb legyen legfelül. Pontosabban a seed fájlban vannak fejjel lefelé.`;
    comment3_2.user = admin;
    comment3_2.post = post3;

    await this.commentRepo.save(comment3_2);

    const post2 = new Post();
    post2.title = 'Ez az izé mozog!';
    post2.slug = 'ez-az-ize-mozog';
    post2.body = `Csinos kis animáció, ugye? Kár, hogy egy kisebb állapotgépet kellett összeraknom érte. (Kulcsszó a 'kisebb', bár ez kezd egyre relatívabb lenni. Szerencsére Redux/NgRx-nél még nem tartunk.)

          Valamikor régen - egy elég közeli galaxisban - az oldal legelső változatában ezt úgy oldottam meg, hogy CSS kulcs animációkat láncoltam össze callback eseményeken keresztül. Lényegében minden HTML elemnek van egy "onAnimationEnd" eseménye 
          amit akkor süt el ha egy stíluslapban definiált animációja befejezte a lejátszását. Ha ezen eseményhez hozzáadunk egy callback metódust akkor egy tetszőlegesen hosszú, eszterláncba kötött animációsorozatot tudunk létrehozni.
          Mai fejjel már nem igazán tudnám ajánlani ezt a megoldást, többek között azért is mert lehetőleg mindig csak egy másik, még nem animált elem osztályát lehetett megváltoztatni következő lépésként, ez pedig komoly limitáció is tud lenni ha nagyravágyó vagy.
          A mostani változat az Angular saját animációs modulját ("@angular/platform-browser/animations") használja ami felettébb nagy hatalmú, de ugyanakkor könnyen túl is tud búrjánozni az állapot átmeneti lista. És nem mellesleg már el is avítatták a következő verziókban, úgyhogy valamikor a jövőben ki kell találnom hogy mivel fogom helyettesíteni.`;
    post2.uploader = admin;
    post2.category = category1;

    await this.postRepo.save(post2);

    const comment2_1 = new Comment();
    comment2_1.message = `Ja, és az a hosszú animáció amiben összecsukódnak meg legördülnek a dolgok csak egyszer játszódik le. A továbbiakban egy rövidebb változat veszi át a helyét hogy ne lehessen olyan hamar megunni. Ha még egyszer szeretnéd látni akkor frissítened kell az oldalt.`;
    comment2_1.user = admin;
    comment2_1.post = post2;

    await this.commentRepo.save(comment2_1);

    const comment2_2 = new Comment();
    comment2_2.message = `Maga a banner/háttérkép amit animálni látsz egy külön komponens amit egy saját service mozgat állapotok közti lépkedésekkel. Ezeket az állapotokat Angular signal-okban tárolom amikhez mindegyik komponensnek hozzáférése van és effect-ekben reagálnak a változásaikra.`;
    comment2_2.user = admin;
    comment2_2.post = post2;

    await this.commentRepo.save(comment2_2);

    const comment2_3 = new Comment();
    comment2_3.parent = comment2_2;
    comment2_3.message = `Sőt, még az oldalak közti tranzíciót is egy állapotgép irányítja, ugyanis elnavigáláskor először szépen megvárja hogy az új oldal háttérképe teljesen betöltődjön (a böngésző elsüti az "onLoad" eseményt a HTML elemen) és csak utána lép tovább.
          Amíg ez nem történik meg addig kitartja a banner képet mint afféle betöltés indikátort és nem vált oldalt. (Az új háttérképet egy külön <img> tag foglalja magában és véletlenül választom egy kollekcióból, csak néha rejtve marad hogy a mögötte lévő banner kép legyen látható.)`;
    comment2_3.user = admin;
    comment2_3.post = post2;

    await this.commentRepo.save(comment2_3);

    const comment2_4 = new Comment();
    comment2_4.parent = comment2_3;
    comment2_4.message = `(Beismerem, hogy SEO szempontokból ez a megoldás valószínűleg nem nagyon lenne szimpatikus a crawlereknek, de most ezt nem is akartam hogy szempont legyen. Meg különben is, ne rajtam tanítsák a botjaikat :E)`;
    comment2_4.user = admin;
    comment2_4.post = post2;

    await this.commentRepo.save(comment2_4);

    const post1 = new Post();
    post1.title = 'Új jövevények itt kezdjenek';
    post1.slug = 'uj-jovevenyek-itt-kezdjenek';
    post1.body = `Légy üdvözölve, vándor!🥾🌍

      Fabók Árpád webfejlesztő vagyok, és ez az oldal egy afféle hobbi projekt amivel meg akartam tanítani magamnak az Angular 17+ keretrendszert, manapság azonban inkább afféle alkalmi blog oldalként használom, csak hogy még több hasznát vehessem.
      Lényegében egy Reddithez hasonló beágyazott komment és tartalom értékelő oldal ami egy szerver oldali Postgres adatbázisban tárolja a bejegyzéseket, és aki a Google fiókján keresztül bejelentkezik az írhat saját posztokat is, illetve hagyhat megjegyzéseket mások írásain.
      (Ez a bejelentkezés nem kötelező, ha inkább nem szeretnél ezzel vesződni akkor is használhatod a közösen megosztott vendég fiókot ugyanezen célokra, csak ehhez mindenkinek hozzáférése van és bárki felülírhatja amit csináltál.)`;
    post1.uploader = admin;
    post1.category = category1;

    await this.postRepo.save(post1);

    const comment1_1 = new Comment();
    comment1_1.message = `Ezeken túl tudsz még kommenteket lájkolni, írni, szerkeszteni, törölni, összecsukni beágyazott komment fákat a tőlük balra lévő vonalra kattintva, vagy írni új posztokat a főoldalon keresztül. Szerintem viszonylag magától érthetődő a legtöbb rész de ha kérdésed lenne ne tartsalak vissza :) 
    Az elérhetőségeimet megtalálhatod a végső "névjegy" posztomban.`;
    comment1_1.user = admin;
    comment1_1.post = post1;

    await this.commentRepo.save(comment1_1);

    const comment1_2 = new Comment();
    comment1_2.message = `Bejelentkezni a jobb felső sarokban található gombon keresztül tudsz, és minden újonnan validált Google fiók email címe elmentésre kerül az adatbázisban.
      Aki ezt nem szeretné és csak kipróbálná hogy melyik gomb mit csinál az nyugodtan maradhat a vendég fióknál, alapértelmezetten ide vagy bejelentkezve.`;
    comment1_2.user = admin;
    comment1_2.post = post1;

    await this.commentRepo.save(comment1_2);

    const comment1_3 = new Comment();
    comment1_3.parent = comment1_2;
    comment1_3.message =
      'Bejelentkezett felhasználók írásait azonban mások nem törölhetik, szerkeszthetik illetve a like-jaikat nem változtathatják. Csak én. Nekem mindent szabad 😏.';
    comment1_3.user = admin;
    comment1_3.post = post1;

    await this.commentRepo.save(comment1_3);
  }
}
