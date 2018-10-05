(function(){

	Mura.init({
		siteid:'headless-demo',
		rootpath:'https://it-demo.muraxp.com',
		containerSelector:'body'
	});

	Mura(()=>{
		let templates={};

		Mura.loader()
			.loadcss(Mura.rootpath + '/core/modules/v1/core_assets/css/mura.7.1.min.css')
			.loadcss(Mura.rootpath + '/core/modules/v1/core_assets/css/mura.7.1.skin.css');

		// build the primary nav
		function buildNav(container,parentid){

			container.html('');

			if(parentid=='00000000000000000000000000000000001'){
				container.html('<li><a href="./#">Home</a></li>');
			}

			Mura.getFeed('content')
			.where()
			.prop('parentid').isEQ(parentid)
			.getQuery()
			.then(collection=>{
				collection.forEach(item=>{
						container.append('<li><a href="' + item.get('url') + '">' + item.get('menutitle') + '</a></li>');
				});
			});
		}

		// create function to render a custom nav  
		function renderNav(container,collection){
			container.html('');
			collection.forEach(item=>{
				container.append('<li><a href="' + item.get('url') + '">' + item.get('menutitle') + '</a></li>');
			});
		}

		// Create the Breadcrumb nav
		function buildCrumbs(content){
			content.get('crumbs').then(collection=>{
				collection.get('items').reverse();
				renderNav( Mura('.mura-crumb-nav'),collection);
			});
		}

		function applyTemplate(template,resolve){
			Mura(Mura.containerSelector).html(template);
			buildNav(Mura('.mura-primary-nav'),'00000000000000000000000000000000001');
			resolve();
		}

		function renderTemplate(template){
			return new Promise(
				(resolve, reject)=>{
					template=template.split('.')[0];
					if(typeof templates[template] == 'undefined'){
						Mura.get('/templates/' + template + '.html').then(resp=>{
							templates[template]=resp;
							applyTemplate(templates[template],resolve);
						});
					} else {
						applyTemplate(templates[template],resolve);
					}
				}
			);
		}

		function render(){
			let hash= location.hash || '#';

			// Get the HTML template 
			alert(Mura.renderFilename);
			
			Mura.renderFilename(
				hash.split('#')[1],
				Mura.getQueryStringParams()
			).then(content=>{

				renderTemplate(content.get('template')).then(()=>{

					// Add the Body
					Mura('.mura-content').html(content.get('body'));
					
					// html head and foot queues to enable admin toolbar and layout manager
					Mura('.mura-html-queues').html(content.get('htmlheadqueue') + content.get('htmlfootqueue'));

					Mura.extend(Mura,content.get('config'));

					// render the various content regions 
					Mura('.mura-region-container').each(item=>{
						var item=Mura(item);
						item.html(content.renderDisplayRegion(item.data('region')));
					});

					// Render the primary nav
					if(content.hasParent() && content.get('type') != 'Folder' && content.get('type') != 'Calendar'){
						buildNav(Mura('.mura-child-nav'),content.get('contentid'));
					} else {
						Mura('.mura-child-nav').html('');
					}

					// build the breadcrumbs
					buildCrumbs(content);

					// Process the markup
					Mura(document).processMarkup();

				})

			});
		}

		render();

		Mura(window).on('hashchange', render);

	});
}());