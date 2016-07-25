var rest = require('../../../lib/rest');
var config = require('../../../lib/config');
var extend = require('extend')

Polymer({
    is: 'app-table',
    
    ready : function() {
      this.queryParams = {
          query : '',
          status : 'Pending Approval',
          limit : 100,
          offset : 0
      };
      this.packages = [];
      this.init = false;
      
      document.querySelector('app-nav').addEventListener('update-query', (e) => {
          this.queryParams.query = '';
          this.$.query.value = '';
          this.queryParams.status = e.detail.status;
          this.query();
      });
    },
    
    attached : function() {
        if( this.init ) return;
        this.init = true;
        
        // initial query set via url
        var hash = decodeURIComponent(window.location.hash.replace('#',''));
        if( hash ) {
            this.$.query.value = hash;
        }
        
        this.query();
    },
    
    query : function() {
        if( this.queryParams.status == "Accepted" ) {
            var options = extend(true, {}, this.queryParams);
            
            options.status = 'Requesting';
            var self = this;
            
            rest.getDoiPackages(options, (packages) => {
                self.packages = packages;
                rest.getDoiPackages(self.queryParams, (packages) => {
                    packages.forEach((p) => {
                        self.packages.push(p);
                    });
                    self.render();
                });
            });

            return;
        }

        rest.getDoiPackages(this.queryParams, this.onPackagesLoad.bind(this));
    },
    
    next : function() {
      if( this.packages.length < 10 ) {
          return;
      }
      this.queryParams.offset += 10;
    },
    
    prev : function() {
      if( this.packages.length == 0 ) {
          return;
      }
      this.queryParams.offset -= 10;
    },
    
    onPackagesLoad : function(packages) {
        this.packages = packages;
        this.render();
    },
    
    onInputKeyPress : function(e) {
        if( e.which === 13 ) {
            this.queryParams.query = this.$.query.value;
            this.query();
        }
    },
    
    render : function() {
        if( this.packages.length === 0 ) {
            if( !this.queryParams.query ) {
                this.$.controls.style.display = 'none';
            } else {
                this.$.controls.style.display = 'flex';
            }
            
            this.$.table.innerHTML = '<div class="alert alert-info">No packages to display</div>';
            return;
        }
        
        if( this.packages.length < 10 ) {
            this.$.navControls.style.display = 'none';
        } else {
            this.$.navControls.style.display = 'inline-block';
        }
        
        this.$.controls.style.display = 'flex';
        var html = `<table class="table">
            <tr>
                <th>Package</th>
                <th>Status</th>
        `;
        
        if( this.queryParams.status === 'Applied' ) {
            html += '<th>DOI</th></tr>';
        } else {
            html += '<th></th></tr>';
        }
        
        this.packages.forEach((pkg) => {
           var btnType = this.getBtnType(pkg);
            
           html += `
            <tr>
                <td><a target="_blank" href="${config.ckan.host}/dataset/${pkg.id}">${pkg.title}</a></td>
                <td>${pkg.status.value}</td>
                <td>`;
                
                
           if( pkg.status.value === 'Pending Approval' ) {
               html += `
                    <div class="btn-group">
                        <button id="btn-${pkg.id}" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Update <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a pkg="${pkg.id}" action="approve">Approve</a></li>
                            <li><a pkg="${pkg.id}" action="deny">Deny, Request More Information</a></li>
                        </ul>
                    </div>`;
           } else if( pkg.status.value === 'Applied' ) {
                html += pkg.doi;
           } else if( pkg.status.value === 'Accepted' && pkg.status.error ) {
                html += `<span class="text text-danger">Error Requesting DOI <a pkg="${pkg.id}" action="approve" id="btn-${pkg.id}" class="btn btn-default">Retry</a></span>`;
           }
                    
           html += `
                </td>
            </tr>
           `;
        });
        
        this.$.table.innerHTML = `${html}</table>`;
        
        $(this.$.table)
            .find('a[action]')
            .on('click', this.onActionClicked.bind(this));
    },
    
    onActionClicked : function(e) {
        var pkgId = e.currentTarget.getAttribute('pkg');
        var action = e.currentTarget.getAttribute('action');
        this.disableBtn(pkgId);
        
        if( action === 'approve' ) {
            rest.setDoiStatus(pkgId, 'Accepted', (resp) => {
               this.enableBtn(pkgId);
               if( resp.error ) {
                   alert(resp.message);
               } else {
                   var status = JSON.parse(rest.getExtra(resp, 'EcoSIS DOI Status'));
                   if( status.error ) {
                       alert(status.message);
                   } else {
                       alert('Success');
                   }
               }
                
               this.query(); 
            });
        } else {
            rest.setDoiStatus(pkgId, 'Pending Revision', (resp) => {
                alert('User '+resp.doi_user_name+' ('+resp.doi_user_email+') has been notified via emailed.  Please follow up with user as to why they were denied.');
               this.enableBtn(pkgId);
               this.query(); 
            });
        }
    },
    
    disableBtn : function(id) {
        var ele = this.querySelector(`#btn-${id}`);
        ele.setAttribute('disabled', 'disabled');
        ele.classList.toggle('disabled');
        ele.innerHTML = 'working...';
    },
    
    enableBtn : function(id) {
        var ele = this.querySelector(`#btn-${id}`);
        ele.removeAttribute('disabled');
        ele.classList.toggle('disabled');
        ele.innerHTML = 'Update <span class="caret"></span>';
    },
    
    getBtnType : function(pkg) {
        if( pkg.status === 'Pending Approval' ) {
            return 'foo';
        }
        return 'bar';
    }
});