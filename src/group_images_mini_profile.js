class Group_Images_Mini_Profile {

	static init(){
		this.add_group_images_to_mini_profile();

		pb.events.on("afterSearch", this.add_group_images_to_mini_profile.bind(this));
	}

	static add_group_images_to_mini_profile(){
		let $mini_profiles = $(".item .mini-profile");

		if(!$mini_profiles.length){
			return;
		}

		$mini_profiles.each((index, item) => {
			let $mini_profile = $(item);
			let $elem = $mini_profile.find(".group-images-mini-profile");
			let $user_link = $mini_profile.find("a.user-link[href*='user/']");
			let $info = $mini_profile.find(".info");

			if(!$elem.length && !$info.length){
				return;
			}

			if($user_link.length){
				let user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

				if(!user_id_match || !parseInt(user_id_match[1], 10)){
					return;
				}

				let user_id = parseInt(user_id_match[1], 10);
				let using_info = false;

				if(!$elem.length){
					using_info = true;
					$elem = $("<div class='group-images-mini-profile'></div>");
				}

				let data = pb.plugin.key(Group_Images.PLUGIN_KEY).get(user_id);

				if(data){
					let user_grp_imgs = [];

					for(let group in data){
						if(data.hasOwnProperty(group)){
							let grp_id = parseInt(group.replace("_", ""), 10);
							let grp_imgs = Group_Images.fetch_group_images(grp_id, data, true);

							if(grp_imgs && grp_imgs.length){
								user_grp_imgs.push({

									id: grp_id,
									imgs: grp_imgs

								})
							}
						}
					}

					if(user_grp_imgs.length){
						let html = "";

						for(let i = 0, l = user_grp_imgs.length; i < l; ++ i){
							if(user_grp_imgs[i].imgs.length > 0){
								for(let g = 0, gl = user_grp_imgs[i].imgs.length; g < gl; ++ g){
									html += "<span class='group-img-item'><a href='/members?group=" + user_grp_imgs[i].id + "&view=group'><img src='" + user_grp_imgs[i].imgs[g] + "' /></a></span>";
								}
							}
						}

						$elem.html(html);

						if(using_info){
							$info.append($elem);
						}
					}
				}
			}

		});
	}

};