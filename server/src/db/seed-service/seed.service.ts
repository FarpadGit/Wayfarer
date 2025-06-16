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
    post5.body = `Helló, kösz hogy mindegyik bejegyzésen végigkattintottál. Fabók Árpád informatikus vagyok és ha kíváncsi vagy a többi munkámra is akkor megtalálhatsz a https://www.fabokarpad.hu weboldalon. Ide töltöm fel a portfóliós és egyéb említésre méltó projektjeimet, valamint itt találod a képesítéseimet és az elérhetőségemet is. Bizony megesik, hogy néha a szabadidőmben ilyen projekteket csinálok a saját jobb belátásom ellenére.`;
    post5.uploader = admin;
    post5.category = category1;

    await this.postRepo.save(post5);

    const post4 = new Post();
    post4.title = 'Technikai részletek, függőségek, telepítés';
    post4.body = `Ja, és ne tudd meg mennyit kellett szenvednem mire működésbe tudtam hozni ezt az oldalt a Vercelen. Kellett nekem egy egzotikus monorepóval szórakoznom 🙄...
          Először is a backend Typescriptben van megírva amit először össze kell állítani Javascriptté és külön feltölteni mert NodeJs projekteknél csak azt tudja futtatni a platform. Ezen túl Express helyett Fastify-t használok, amit egy külön default exportált metódussal kell ellátni, hogy a megfelelő belépési ponton tudja futtatni mint serverless functiont.
          Ezután kell még egy vercel.json nevű konfigurációs fájl is mind a backend, mind a frontend könyvtárába ami többek közt átirányítja a webkéréseket hogy SPA oldalként tudjon működni, illetve hogy fejléceket állítson be a CORS miatt.
          Ja, és mivel a backend az adatbázissal Prisma ORM-en keresztül kommunikál ezért azt is újra migrálni kell minden build parancs elején a platform oldalon hogy biztos szinkronban legyen a DB-vel...
          És valamiért még az Angular frontendnek is külön meg kell adnia, hogy milyen mappában keresse a lefordított kész fájlokat. (Alapvetően a 'dist/<project könyvtár>/browser' helyre fordít az ng build parancs, de ezt nem feltételezi alapból, ne kérdezd miért.)
          Talán most már működik 🤞.`;
    post4.uploader = admin;
    post4.category = category1;

    await this.postRepo.save(post4);

    const comment4_1 = new Comment();
    comment4_1.message = `Ami a függőségeket illeti, először is a szervernek küldött kéréseket az Axios könyvtárcsomagon keresztül intézi a weboldal. A felugró ablakokhoz (bár a többsége inkább "leugró") egy ngx-modal-ease nevű csomagot használ, a poszt lista lapozhatóvá tételéhez ngx-pagination-t, illetve a Google fiókos bejelentkezésért az angular-oauth2-oidc nevű csomag felel.
          Ezeken túl még egy ngx-linky nevű könyvtárat is használ ami automatikusan linkekké változtatja a posztokban szereplő email címeket, weboldal url-eket, stb., valamint egyéb kisebb ikonok is be lettek importálva az ng-icons könyvtárból.`;
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
    post3.body = `Maga a frontend oldal (amit most látsz) Angular 17+ keretrendszerrel készült ami TypeScript 5.3 és SCSS stíluslapokat használ. A szerver oldal ami egy PostgreSQL adatbázissal kommunikál és fogadja a kéréseket egy Node.js-ben írt REST API ami egy Fastify nevű web keretrendszerre épül és Prisma-n keresztül kommunikál a DB-vel.
          Ez a szerver minden kliens oldali kérés válaszához egy cookie-t és egy saját fejlécet csatol amivel azonosítja a felhasználót aki a kérést intézte (vendég vagy bejelentkezett). Ez alapján tudja a böngésző összehasonlítani, hogy pl. az adott poszt szerzője van-e bejelentkezve.
          Ha érdekel a forráskód itt megtalálhatod, mindkét projekt egy monorepo-ban van: https://www.github.com/FarpadGit/Wayfarer`;
    post3.uploader = admin;
    post3.category = category1;

    await this.postRepo.save(post3);

    const comment3_1 = new Comment();
    comment3_1.message = `Amikor létrehozol egy új kommentet (vagy szerkeszted, vagy törlöd, stb.) ezt a változást a böngésző először elküldi a szerver oldali adatbázisnak, de nem várja meg a válaszát, azonnal helyben elvégzi anélkül hogy a többi kommentet újratöltené. Új posztok vagy járások (kategóriák) létrehozásakor ez kicsit másképp van, ekkor valóban kér egy teljes újralekérdezést az összes releváns adatról miután a beszúrás/törlés megtörtént.
            Ez főleg a listanézet lapozhatóságát szolgálja. (A jelenlegi beállítás hogy 6 posztot látsz oldalanként, legújabbtól a legrégebbig.) És természetesen egy poszt megnyitásakor szintén szinkronba kerülsz a szerver oldali állapottal.`;
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
    post2.body = `Csinos kis animáció, ugye? Kár, hogy egy kisebb állapotgépet kellett összeraknom érte. (Kulcsszó a 'kisebb', bár ez kezd egyre relatívabb lenni. Szerencsére Redux/NgRx-nél még nem tartunk.)
          Ha hiszed ha nem az oldal legelső változatában ezt úgy oldottam meg, hogy CSS kulcs animációkat láncoltam össze callback eseményeken keresztül. Minden HTML elemnek van egy onAnimationEnd eseménye amit akkor süt el ha egy stíluslapban definiált animációja befejezte a lejátszását. Ha ezen eseményhez hozzáadunk egy callback metódust akkor egy tetszőlegesen hosszú, eszterláncba kötött animációsorozatot tudunk létrehozni.
          Ennek a módszernek megvoltak az előnyei és hátrányai, az egyik közülük hogy lehetőleg mindig csak egy másik, még nem animált elem osztályát lehetett megváltoztatni következő lépésként.
          A mostani változat az Angular saját animációs modulját használja ami felettébb nagy hatalmú, de ugyanakkor könnyen túl is tud búrjánozni az állapot átmeneti lista.`;
    post2.uploader = admin;
    post2.category = category1;

    await this.postRepo.save(post2);

    const comment2_1 = new Comment();
    comment2_1.message = `Ja, és az a hosszú animáció amiben összecsukódnak meg legördülnek a dolgok csak egyszer játszódik le. A továbbiakban egy rövidített elhomályosodás veszi át a helyét hogy ne lehessen olyan hamar megunni. Ha még egyszer akarod látni akkor frissítened kell az oldalt.`;
    comment2_1.user = admin;
    comment2_1.post = post2;

    await this.commentRepo.save(comment2_1);

    const comment2_2 = new Comment();
    comment2_2.message = `Maga a banner/háttérkép amit animálni látsz egy külön komponens amit egy saját service mozgat állapotok közti lépkedésekkel. Ezek az állapotok Angular signal-okban vannak tárolva amikhez mindegyik komponensnek hozzáférése van és effect-ekben reagálhat a változásaikra.`;
    comment2_2.user = admin;
    comment2_2.post = post2;

    await this.commentRepo.save(comment2_2);

    const comment2_3 = new Comment();
    comment2_3.parent = comment2_2;
    comment2_3.message = `Sőt, még az oldalak közti tranzíciót is egy állapotgép irányítja, mivel elnavigáláskor először szépen megvárja hogy az új oldal háttérképe teljesen betöltődjön (a HTML elem meghívja az onLoad eseményt) és csak utána lép tovább.
          Amíg ez nem történik meg addig kitartja a banner képet mint afféle betöltés indikátort és nem vált oldalt. (Az új háttérképet egy külön <img> tag foglalja magában a komponensben, csak néha rejtve marad hogy a banner kép legyen látható.)`;
    comment2_3.user = admin;
    comment2_3.post = post2;

    await this.commentRepo.save(comment2_3);

    const comment2_4 = new Comment();
    comment2_4.parent = comment2_3;
    comment2_4.message = `(Beismerem, hogy SEO szempontokból ez a megoldás valószínűleg nem nagyon lenne szimpatikus a crawlereknek, de most ezt nem is akartam hogy szempont legyen.)`;
    comment2_4.user = admin;
    comment2_4.post = post2;

    await this.commentRepo.save(comment2_4);

    const post1 = new Post();
    post1.title = 'Új jövevények itt kezdjenek';
    post1.body = `Légy üdvözölve, vándor!
      Fabók Árpád webfejlesztő vagyok, és ez az oldal egy afféle hobbi projekt amivel meg akartam tanítani magamnak az Angular 17+-ot.
      Lényegében egy Reddithez hasonló beágyazott komment és tartalom értékelő oldal ami egy szerver oldali Postgres adatbázisban tárolja a bejegyzéseket, és aki Google fiókján keresztül bejelentkezik az írhat saját posztokat is, illetve hagyhat megjegyzéseket mások írásain.
      (Ez a bejelentkezés nem kötelező, ha inkább nem szeretnél ilyen módon belépni akkor is használhatod a közösen megosztott vendég fiókot ugyanezen célokra, csak ehhez mindenkinek hozzáférése van és bárki felülírhatja amit csináltál.)`;
    post1.uploader = admin;
    post1.category = category1;

    await this.postRepo.save(post1);

    const comment1_1 = new Comment();
    comment1_1.message = `Ezeken túl tudsz még kommenteket lájkolni, írni, szerkeszteni, törölni, összecsukni beágyazott komment fákat a tőlük balra lévő vonalra kattintva, vagy írni új posztokat a főoldalon keresztül. Szerintem viszonylag magától érthetődő a legtöbb rész de ha kérdésed lenne ne tartsalak vissza :)`;
    comment1_1.user = admin;
    comment1_1.post = post1;

    await this.commentRepo.save(comment1_1);

    const comment1_2 = new Comment();
    comment1_2.message = `Bejelentkezni a jobb felső sarokban található gombon keresztül lehet, és minden újonnan validált Google fiók email címe elmentésre kerül az adatbázisban.
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
