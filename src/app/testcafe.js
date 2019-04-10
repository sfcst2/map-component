import { Selector, ClientFunction } from 'testcafe';

fixture `LocalHostTest`
    .page `http://localhost:4200`;

test('New Test', async t => {
        
        const canvasSelector = await Selector('.ol-unselectable').nth(0);        
            
        const getBase64 = ClientFunction(() => {
            let val = document.getElementsByTagName('canvas')[0].toDataURL();                       
            return val;
        });
        const beforeImg = await getBase64();

        await t.click(Selector('button').withText('Draw'))
        .click(Selector('button').withText('Circle'))
        .click(canvasSelector, {
            offsetX: 300,
            offsetY: 300
        })
        .click(canvasSelector.nth(0), {
            offsetX: 330,
            offsetY: 300
        });
    
        // Wait for openlayers to finish drawing
        await t.wait(1000);
        // Get the base image
        const afterImg = await getBase64();        
        // Check that the canvas images are different
        await t.expect(beforeImg).notEql(afterImg);

        await t.click(Selector('button').withText('Delete'))        
        .click(canvasSelector, {
            offsetX: 300,
            offsetY: 300
        });

        // Wait for openlayers to finish updating
        await t.wait(1000);
        const imgAfterDelete = await getBase64();
        await t.expect(beforeImg).eql(imgAfterDelete);
    
});
