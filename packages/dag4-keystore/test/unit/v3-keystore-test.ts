import {expect} from 'chai';
import {keyStore} from '../../src';

describe('V3 Keystore', () => {

  it('encrypt / decrypt', async () => {

    const phrase = "solution rookie cake shine hand attack claw awful harsh level case vocal";

    const jsonKey = await keyStore.encryptPhrase(phrase, 'password');

    const phrase2 = await keyStore.decryptPhrase(jsonKey, 'password');

    expect(phrase2).to.equal(phrase);
  });


});
